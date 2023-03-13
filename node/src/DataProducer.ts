import { Logger } from './Logger';
import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { Channel } from './Channel';
import { TransportInternal } from './Transport';
import { parseSctpStreamParameters, SctpStreamParameters } from './SctpParameters';
import * as FbsTransport from './fbs/transport';
import * as FbsNotification from './fbs/notification';
import * as FbsRequest from './fbs/request';
import * as FbsDataProducer from './fbs/data-producer';

export type DataProducerOptions =
{
	/**
	 * DataProducer id (just for Router.pipeToRouter() method).
	 */
	id?: string;

	/**
	 * SCTP parameters defining how the endpoint is sending the data.
	 * Just if messages are sent over SCTP.
	 */
	sctpStreamParameters?: SctpStreamParameters;

	/**
	 * A label which can be used to distinguish this DataChannel from others.
	 */
	label?: string;

	/**
	 * Name of the sub-protocol used by this DataChannel.
	 */
	protocol?: string;

	/**
	 * Custom application data.
	 */
	appData?: Record<string, unknown>;
};

export type DataProducerStat =
{
	type: string;
	timestamp: number;
	label: string;
	protocol: string;
	messagesReceived: number;
	bytesReceived: number;
};

/**
 * DataProducer type.
 */
export type DataProducerType = 'sctp' | 'direct';

export type DataProducerEvents =
{
	transportclose: [];
	// Private events.
	'@close': [];
};

export type DataProducerObserverEvents =
{
	close: [];
};

type DataProducerDump = DataProducerData & {
	id: string;
};

type DataProducerInternal = TransportInternal &
{
	dataProducerId: string;
};

type DataProducerData =
{
	type: DataProducerType;
	sctpStreamParameters?: SctpStreamParameters;
	label: string;
	protocol: string;
};

const logger = new Logger('DataProducer');

export class DataProducer extends EnhancedEventEmitter<DataProducerEvents>
{
	// Internal data.
	readonly #internal: DataProducerInternal;

	// DataProducer data.
	readonly #data: DataProducerData;

	// Channel instance.
	readonly #channel: Channel;

	// Closed flag.
	#closed = false;

	// Custom app data.
	readonly #appData: Record<string, unknown>;

	// Observer instance.
	readonly #observer = new EnhancedEventEmitter<DataProducerObserverEvents>();

	/**
	 * @private
	 */
	constructor(
		{
			internal,
			data,
			channel,
			appData
		}:
		{
			internal: DataProducerInternal;
			data: DataProducerData;
			channel: Channel;
			appData?: Record<string, unknown>;
		}
	)
	{
		super();

		logger.debug('constructor()');

		this.#internal = internal;
		this.#data = data;
		this.#channel = channel;
		this.#appData = appData || {};

		this.handleWorkerNotifications();
	}

	/**
	 * DataProducer id.
	 */
	get id(): string
	{
		return this.#internal.dataProducerId;
	}

	/**
	 * Whether the DataProducer is closed.
	 */
	get closed(): boolean
	{
		return this.#closed;
	}

	/**
	 * DataProducer type.
	 */
	get type(): DataProducerType
	{
		return this.#data.type;
	}

	/**
	 * SCTP stream parameters.
	 */
	get sctpStreamParameters(): SctpStreamParameters | undefined
	{
		return this.#data.sctpStreamParameters;
	}

	/**
	 * DataChannel label.
	 */
	get label(): string
	{
		return this.#data.label;
	}

	/**
	 * DataChannel protocol.
	 */
	get protocol(): string
	{
		return this.#data.protocol;
	}

	/**
	 * App custom data.
	 */
	get appData(): Record<string, unknown>
	{
		return this.#appData;
	}

	/**
	 * Invalid setter.
	 */
	set appData(appData: Record<string, unknown>) // eslint-disable-line no-unused-vars
	{
		throw new Error('cannot override appData object');
	}

	/**
	 * Observer.
	 */
	get observer(): EnhancedEventEmitter<DataProducerObserverEvents>
	{
		return this.#observer;
	}

	/**
	 * Close the DataProducer.
	 */
	close(): void
	{
		if (this.#closed)
		{
			return;
		}

		logger.debug('close()');

		this.#closed = true;

		// Remove notification subscriptions.
		this.#channel.removeAllListeners(this.#internal.dataProducerId);

		/* Build Request. */

		const requestOffset = new FbsTransport.CloseDataProducerRequestT(
			this.#internal.dataProducerId
		).pack(this.#channel.bufferBuilder);

		this.#channel.request(
			FbsRequest.Method.TRANSPORT_CLOSE_DATA_PRODUCER,
			FbsRequest.Body.FBS_Transport_CloseDataProducerRequest,
			requestOffset,
			this.#internal.transportId
		).catch(() => {});

		this.emit('@close');

		// Emit observer event.
		this.#observer.safeEmit('close');
	}

	/**
	 * Transport was closed.
	 *
	 * @private
	 */
	transportClosed(): void
	{
		if (this.#closed)
		{
			return;
		}

		logger.debug('transportClosed()');

		this.#closed = true;

		// Remove notification subscriptions.
		this.#channel.removeAllListeners(this.#internal.dataProducerId);

		this.safeEmit('transportclose');

		// Emit observer event.
		this.#observer.safeEmit('close');
	}

	/**
	 * Dump DataProducer.
	 */
	async dump(): Promise<DataProducerDump>
	{
		logger.debug('dump()');

		const response = await this.#channel.request(
			FbsRequest.Method.DATA_PRODUCER_DUMP,
			undefined,
			undefined,
			this.#internal.dataProducerId
		);

		/* Decode the response. */
		const produceResponse = new FbsDataProducer.DumpResponse();

		response.body(produceResponse);

		return parseDataProducerDump(produceResponse);
	}

	/**
	 * Get DataProducer stats.
	 */
	async getStats(): Promise<DataProducerStat[]>
	{
		logger.debug('getStats()');

		const response = await this.#channel.request(
			FbsRequest.Method.DATA_PRODUCER_GET_STATS,
			undefined,
			undefined,
			this.#internal.dataProducerId
		);

		/* Decode the response. */
		const data = new FbsDataProducer.GetStatsResponse();

		response.body(data);

		return [ parseDataProducerStats(data) ];
	}

	/**
	 * Send data (just valid for DataProducers created on a DirectTransport).
	 */
	send(message: string | Buffer, ppid?: number): void
	{
		if (typeof message !== 'string' && !Buffer.isBuffer(message))
		{
			throw new TypeError('message must be a string or a Buffer');
		}

		/*
		 * +-------------------------------+----------+
		 * | Value                         | SCTP     |
		 * |                               | PPID     |
		 * +-------------------------------+----------+
		 * | WebRTC String                 | 51       |
		 * | WebRTC Binary Partial         | 52       |
		 * | (Deprecated)                  |          |
		 * | WebRTC Binary                 | 53       |
		 * | WebRTC String Partial         | 54       |
		 * | (Deprecated)                  |          |
		 * | WebRTC String Empty           | 56       |
		 * | WebRTC Binary Empty           | 57       |
		 * +-------------------------------+----------+
		 */

		if (typeof ppid !== 'number')
		{
			ppid = (typeof message === 'string')
				? message.length > 0 ? 51 : 56
				: message.length > 0 ? 53 : 57;
		}

		// Ensure we honor PPIDs.
		if (ppid === 56)
		{
			message = ' ';
		}
		else if (ppid === 57)
		{
			message = Buffer.alloc(1);
		}

		let dataOffset = 0;

		const builder = this.#channel.bufferBuilder;

		if (typeof message === 'string')
		{
			const messageOffset = builder.createString(message);

			dataOffset = FbsDataProducer.String.createString(builder, messageOffset);
		}
		else
		{
			const messageOffset = FbsDataProducer.Binary.createValueVector(builder, message);

			dataOffset = FbsDataProducer.Binary.createBinary(builder, messageOffset);
		}

		const notificationOffset = FbsDataProducer.SendNotification.createSendNotification(
			builder,
			ppid,
			typeof message === 'string' ?
				FbsDataProducer.Data.String :
				FbsDataProducer.Data.Binary,
			dataOffset
		);

		this.#channel.notify(
			FbsNotification.Event.DATA_PRODUCER_SEND,
			FbsNotification.Body.FBS_DataProducer_SendNotification,
			notificationOffset,
			this.#internal.dataProducerId
		);
	}

	private handleWorkerNotifications(): void
	{
		// No need to subscribe to any event.
	}
}

export function parseDataProducerDump(
	data: FbsDataProducer.DumpResponse
): DataProducerDump
{
	return {
		id                   : data.id()!,
		type                 : data.type()! as DataProducerType,
		sctpStreamParameters : data.sctpStreamParameters() !== null ?
			parseSctpStreamParameters(data.sctpStreamParameters()!) :
			undefined,
		label    : data.label()!,
		protocol : data.protocol()!
	};
}

function parseDataProducerStats(
	binary: FbsDataProducer.GetStatsResponse
):DataProducerStat
{
	return {
		type             : 'data-producer',
		timestamp        : Number(binary.timestamp()),
		label            : binary.label()!,
		protocol         : binary.protocol()!,
		messagesReceived : Number(binary.messagesReceived()),
		bytesReceived    : Number(binary.bytesReceived())
	};
}
