import * as os from 'os';
import { Duplex } from 'stream';
import * as flatbuffers from 'flatbuffers';
import { Logger } from './Logger';
import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { InvalidStateError } from './errors';
import { Request } from './fbs/fbs/request/request';
import { Response } from './fbs/fbs/response/response';
import { Body as RequestBody, Method } from './fbs/request_generated';

const littleEndian = os.endianness() == 'LE';
const logger = new Logger('Channel');

type Sent =
{
	id: number;
	method: string;
	resolve: (data?: any) => void;
	reject: (error: Error) => void;
	close: () => void;
};

// Binary length for a 4194304 bytes payload.
const MESSAGE_MAX_LEN = 4194308;
const PAYLOAD_MAX_LEN = 4194304;

export class Channel extends EnhancedEventEmitter
{
	// Closed flag.
	#closed = false;

	// Unix Socket instance for sending messages to the worker process.
	readonly #producerSocket: Duplex;

	// Unix Socket instance for receiving messages to the worker process.
	readonly #consumerSocket: Duplex;

	// Next id for messages sent to the worker process.
	#nextId = 0;

	// Map of pending sent requests.
	readonly #sents: Map<number, Sent> = new Map();

	// Buffer for reading messages from the worker.
	#recvBuffer = Buffer.alloc(0);

	// flatbuffers builder.
	#bufferBuilder:flatbuffers.Builder = new flatbuffers.Builder(1024);

	/**
	 * @private
	 */
	constructor(
		{
			producerSocket,
			consumerSocket,
			pid
		}:
		{
			producerSocket: any;
			consumerSocket: any;
			pid: number;
		})
	{
		super();

		logger.debug('constructor()');

		this.#producerSocket = producerSocket as Duplex;
		this.#consumerSocket = consumerSocket as Duplex;

		// Read Channel responses/notifications from the worker.
		this.#consumerSocket.on('data', (buffer: Buffer) =>
		{
			if (!this.#recvBuffer.length)
			{
				this.#recvBuffer = buffer;
			}
			else
			{
				this.#recvBuffer = Buffer.concat(
					[ this.#recvBuffer, buffer ],
					this.#recvBuffer.length + buffer.length);
			}

			if (this.#recvBuffer.length > PAYLOAD_MAX_LEN)
			{
				logger.error('receiving buffer is full, discarding all data in it');

				// Reset the buffer and exit.
				this.#recvBuffer = Buffer.alloc(0);

				return;
			}

			let msgStart = 0;

			while (true) // eslint-disable-line no-constant-condition
			{
				const readLen = this.#recvBuffer.length - msgStart;

				if (readLen < 4)
				{
					// Incomplete data.
					break;
				}

				const dataView = new DataView(
					this.#recvBuffer.buffer,
					this.#recvBuffer.byteOffset + msgStart);
				const msgLen = dataView.getUint32(0, littleEndian);

				if (readLen < 4 + msgLen)
				{
					// Incomplete data.
					break;
				}

				const payload = this.#recvBuffer.subarray(msgStart + 4, msgStart + 4 + msgLen);

				msgStart += 4 + msgLen;

				try
				{
					// We can receive JSON messages (Channel messages) or log strings.
					switch (payload[0])
					{
						// 123 = '{' (a Channel JSON message).
						case 123:
							this.processMessage(JSON.parse(payload.toString('utf8')));
							break;

						// 68 = 'D' (a debug log).
						case 68:
							logger.debug(`[pid:${pid}] ${payload.toString('utf8', 1)}`);
							break;

						// 87 = 'W' (a warn log).
						case 87:
							logger.warn(`[pid:${pid}] ${payload.toString('utf8', 1)}`);
							break;

						// 69 = 'E' (an error log).
						case 69:
							logger.error(`[pid:${pid} ${payload.toString('utf8', 1)}`);
							break;

						// 88 = 'X' (a dump log).
						case 88:
							// eslint-disable-next-line no-console
							console.log(payload.toString('utf8', 1));
							break;

						default:
							// TODO: Consider it a flatbuffer.
							this.processBuffer(payload);
					}
				}
				catch (error)
				{
					logger.error(
						'received invalid message from the worker process: %s',
						String(error));
				}
			}

			if (msgStart != 0)
			{
				this.#recvBuffer = this.#recvBuffer.slice(msgStart);
			}
		});

		this.#consumerSocket.on('end', () => (
			logger.debug('Consumer Channel ended by the worker process')
		));

		this.#consumerSocket.on('error', (error) => (
			logger.error('Consumer Channel error: %s', String(error))
		));

		this.#producerSocket.on('end', () => (
			logger.debug('Producer Channel ended by the worker process')
		));

		this.#producerSocket.on('error', (error) => (
			logger.error('Producer Channel error: %s', String(error))
		));
	}

	/**
	 * flatbuffer builder.
	 */
	get bufferBuilder(): flatbuffers.Builder
	{
		return this.#bufferBuilder;
	}

	/**
	 * @private
	 */
	close(): void
	{
		if (this.#closed)
			return;

		logger.debug('close()');

		this.#closed = true;

		// Close every pending sent.
		for (const sent of this.#sents.values())
		{
			sent.close();
		}

		// Remove event listeners but leave a fake 'error' hander to avoid
		// propagation.
		this.#consumerSocket.removeAllListeners('end');
		this.#consumerSocket.removeAllListeners('error');
		this.#consumerSocket.on('error', () => {});

		this.#producerSocket.removeAllListeners('end');
		this.#producerSocket.removeAllListeners('error');
		this.#producerSocket.on('error', () => {});

		// Destroy the socket after a while to allow pending incoming messages.
		setTimeout(() =>
		{
			try { this.#producerSocket.destroy(); }
			catch (error) {}
			try { this.#consumerSocket.destroy(); }
			catch (error) {}
		}, 200);
	}

	/**
	 * @private
	 */
	async request(method: string, handlerId?: string, data?: any): Promise<any>
	{
		this.#nextId < 4294967295 ? ++this.#nextId : (this.#nextId = 1);

		const id = this.#nextId;

		logger.debug('request() [method:%s, id:%s]', method, id);

		if (this.#closed)
			throw new InvalidStateError('Channel closed');

		const request = `r${id}:${method}:${handlerId}:${JSON.stringify(data)}`;

		if (Buffer.byteLength(request) > MESSAGE_MAX_LEN)
			throw new Error('Channel request too big');

		// This may throw if closed or remote side ended.
		this.#producerSocket.write(
			Buffer.from(Uint32Array.of(Buffer.byteLength(request)).buffer));
		this.#producerSocket.write(request);

		return new Promise((pResolve, pReject) =>
		{
			const sent: Sent =
			{
				id      : id,
				method  : method,
				resolve : (data2) =>
				{
					if (!this.#sents.delete(id))
						return;

					pResolve(data2);
				},
				reject : (error) =>
				{
					if (!this.#sents.delete(id))
						return;

					pReject(error);
				},
				close : () =>
				{
					pReject(new InvalidStateError('Channel closed'));
				}
			};

			// Add sent stuff to the map.
			this.#sents.set(id, sent);
		});
	}

	async requestBinary(
		method: Method,
		bodyType?: RequestBody,
		bodyOffset?: number,
		handlerId?: string): Promise<Response>
	{
		this.#nextId < 4294967295 ? ++this.#nextId : (this.#nextId = 1);

		const id = this.#nextId;

		logger.error('request() [method:%s, id:%s]', id);

		if (this.#closed)
			throw new InvalidStateError('Channel closed');

		const handlerIdOffset = this.#bufferBuilder.createString(handlerId);

		let requestOffset: number;

		if (bodyType && bodyOffset)
		{
			requestOffset = Request.createRequest(
				this.#bufferBuilder, id, method, handlerIdOffset, bodyType, bodyOffset);
		}
		else
		{
			requestOffset = Request.createRequest(
				this.#bufferBuilder, id, method, handlerIdOffset, RequestBody.NONE, 0);
		}

		this.#bufferBuilder.finish(requestOffset);

		const buffer = this.#bufferBuilder.asUint8Array();

		if (buffer.byteLength > MESSAGE_MAX_LEN)
			throw new Error('Channel request too big');

		// This may throw if closed or remote side ended.
		this.#producerSocket.write(
			Buffer.from(Uint32Array.of(buffer.byteLength).buffer));
		// Set buffer enconding to 'binary.'
		this.#producerSocket.write(buffer, 'binary');

		return new Promise((pResolve, pReject) =>
		{
			const sent: Sent =
			{
				id      : id,
				method  : '',
				resolve : (data2) =>
				{
					if (!this.#sents.delete(id))
						return;

					pResolve(data2);
				},
				reject : (error) =>
				{
					if (!this.#sents.delete(id))
						return;

					pReject(error);
				},
				close : () =>
				{
					pReject(new InvalidStateError('Channel closed'));
				}
			};

			// Add sent stuff to the map.
			this.#sents.set(id, sent);
		});
	}

	private processMessage(msg: any): void
	{
		// If a response, retrieve its associated request.
		if (msg.id)
		{
			const sent = this.#sents.get(msg.id);

			if (!sent)
			{
				logger.error(
					'received response does not match any sent request [id:%s]', msg.id);

				return;
			}

			if (msg.accepted)
			{
				logger.debug(
					'request succeeded [method:%s, id:%s]', sent.method, sent.id);

				sent.resolve(msg.data);
			}
			else if (msg.error)
			{
				logger.warn(
					'request failed [method:%s, id:%s]: %s',
					sent.method, sent.id, msg.reason);

				switch (msg.error)
				{
					case 'TypeError':
						sent.reject(new TypeError(msg.reason));
						break;

					default:
						sent.reject(new Error(msg.reason));
				}
			}
			else
			{
				logger.error(
					'received response is not accepted nor rejected [method:%s, id:%s]',
					sent.method, sent.id);
			}
		}
		// If a notification emit it to the corresponding entity.
		else if (msg.targetId && msg.event)
		{
			// Due to how Promises work, it may happen that we receive a response
			// from the worker followed by a notification from the worker. If we
			// emit the notification immediately it may reach its target **before**
			// the response, destroying the ordered delivery. So we must wait a bit
			// here.
			// See https://github.com/versatica/mediasoup/issues/510
			setImmediate(() => this.emit(String(msg.targetId), msg.event, msg.data));
		}
		// Otherwise unexpected message.
		else
		{
			logger.error(
				'received message is not a response nor a notification');
		}
	}

	private processBuffer(data: Buffer): void
	{
		const buffer = new flatbuffers.ByteBuffer(new Uint8Array(data));

		const msg = Response.getRootAsResponse(buffer);

		// If a response, retrieve its associated request.
		if (msg.id())
		{
			const sent = this.#sents.get(msg.id());

			if (!sent)
			{
				logger.error(
					'received response does not match any sent request [id:%s]', msg.id);

				return;
			}

			if (msg.accepted())
			{
				logger.debug(
					'request succeeded [method:%s, id:%s]', sent.method, sent.id);

				sent.resolve(msg);
			}
			/*
			else if (msg.error)
			{
				logger.warn(
					'request failed [method:%s, id:%s]: %s',
					sent.method, sent.id, msg.reason);

				switch (msg.error)
				{
					case 'TypeError':
						sent.reject(new TypeError(msg.reason));
						break;

					default:
						sent.reject(new Error(msg.reason));
				}
			}
			*/
			else
			{
				logger.error(
					'received response is not accepted nor rejected [method:%s, id:%s]',
					sent.method, sent.id);
			}
		}
		/*
		// If a notification emit it to the corresponding entity.
		else if (msg.targetId && msg.event)
		{
			// Due to how Promises work, it may happen that we receive a response
			// from the worker followed by a notification from the worker. If we
			// emit the notification immediately it may reach its target **before**
			// the response, destroying the ordered delivery. So we must wait a bit
			// here.
			// See https://github.com/versatica/mediasoup/issues/510
			setImmediate(() => this.emit(String(msg.targetId), msg.event, msg.data));
		}
		// Otherwise unexpected message.
		else
		{
			logger.error(
				'received message is not a response nor a notification');
		}
		*/
	}
}
