import * as os from 'node:os';
import * as process from 'node:process';
import * as path from 'node:path';
import * as mediasoup from '../';
import { InvalidStateError } from '../errors';

let worker: mediasoup.types.Worker;

beforeEach(() => worker && !worker.closed && worker.close());
afterEach(() => worker && !worker.closed && worker.close());

test('Worker.workerBin matches mediasoup-worker absolute path', async () =>
{
	const workerBin = process.env.MEDIASOUP_WORKER_BIN
		? process.env.MEDIASOUP_WORKER_BIN
		: process.env.MEDIASOUP_BUILDTYPE === 'Debug'
			? path.join(__dirname, '..', '..', '..', 'worker', 'out', 'Debug', 'mediasoup-worker')
			: path.join(__dirname, '..', '..', '..', 'worker', 'out', 'Release', 'mediasoup-worker');

	expect(mediasoup.workerBin).toBe(workerBin);
});

test('createWorker() succeeds', async () =>
{
	const onObserverNewWorker = jest.fn();

	mediasoup.observer.once('newworker', onObserverNewWorker);

	worker = await mediasoup.createWorker();

	expect(onObserverNewWorker).toHaveBeenCalledTimes(1);
	expect(onObserverNewWorker).toHaveBeenCalledWith(worker);
	expect(worker.constructor.name).toBe('Worker');
	expect(typeof worker.pid).toBe('number');
	expect(worker.closed).toBe(false);
	expect(worker.died).toBe(false);

	worker.close();

	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(false);

	// eslint-disable-next-line require-atomic-updates
	worker = await mediasoup.createWorker<{ foo: number; bar?: string }>(
		{
			logLevel             : 'debug',
			logTags              : [ 'info' ],
			rtcMinPort           : 0,
			rtcMaxPort           : 9999,
			dtlsCertificateFile  : path.join(__dirname, 'data', 'dtls-cert.pem'),
			dtlsPrivateKeyFile   : path.join(__dirname, 'data', 'dtls-key.pem'),
			libwebrtcFieldTrials : 'WebRTC-Bwe-AlrLimitedBackoff/Disabled/',
			appData              : { foo: 456 }
		});
	expect(worker.constructor.name).toBe('Worker');
	expect(typeof worker.pid).toBe('number');
	expect(worker.closed).toBe(false);
	expect(worker.died).toBe(false);
	expect(worker.appData).toEqual({ foo: 456 });

	worker.close();

	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(false);
}, 2000);

test('createWorker() with wrong settings rejects with TypeError', async () =>
{
	// @ts-ignore
	await expect(mediasoup.createWorker({ logLevel: 'chicken' }))
		.rejects
		.toThrow(TypeError);

	await expect(mediasoup.createWorker({ rtcMinPort: 1000, rtcMaxPort: 999 }))
		.rejects
		.toThrow(TypeError);

	// Port is from 0 to 65535.
	await expect(mediasoup.createWorker({ rtcMinPort: 1000, rtcMaxPort: 65536 }))
		.rejects
		.toThrow(TypeError);

	await expect(mediasoup.createWorker({ dtlsCertificateFile: '/notfound/cert.pem' }))
		.rejects
		.toThrow(TypeError);

	await expect(mediasoup.createWorker({ dtlsPrivateKeyFile: '/notfound/priv.pem' }))
		.rejects
		.toThrow(TypeError);

	// @ts-ignore
	await expect(mediasoup.createWorker({ appData: 'NOT-AN-OBJECT' }))
		.rejects
		.toThrow(TypeError);
}, 2000);

test('worker.updateSettings() succeeds', async () =>
{
	worker = await mediasoup.createWorker();

	await expect(worker.updateSettings({ logLevel: 'debug', logTags: [ 'ice' ] }))
		.resolves
		.toBeUndefined();

	worker.close();
}, 2000);

test('worker.updateSettings() with wrong settings rejects with TypeError', async () =>
{
	worker = await mediasoup.createWorker();

	// @ts-ignore
	await expect(worker.updateSettings({ logLevel: 'chicken' }))
		.rejects
		.toThrow(TypeError);

	worker.close();
}, 2000);

test('worker.updateSettings() rejects with InvalidStateError if closed', async () =>
{
	worker = await mediasoup.createWorker();
	worker.close();

	await expect(worker.updateSettings({ logLevel: 'error' }))
		.rejects
		.toThrow(InvalidStateError);

	worker.close();
}, 2000);

test('worker.dump() succeeds', async () =>
{
	worker = await mediasoup.createWorker();

	await expect(worker.dump())
		.resolves
		.toMatchObject(
			{
				pid                    : worker.pid,
				webRtcServerIds        : [],
				routerIds              : [],
				channelMessageHandlers :
				{
					channelRequestHandlers      : [],
					channelNotificationHandlers : []
				}
			});

	worker.close();
}, 2000);

test('worker.dump() rejects with InvalidStateError if closed', async () =>
{
	worker = await mediasoup.createWorker();
	worker.close();

	await expect(worker.dump())
		.rejects
		.toThrow(InvalidStateError);

	worker.close();
}, 2000);

test('worker.getResourceUsage() succeeds', async () =>
{
	worker = await mediasoup.createWorker();

	await expect(worker.getResourceUsage())
		.resolves
		.toMatchObject({});

	worker.close();
}, 2000);

test('worker.close() succeeds', async () =>
{
	worker = await mediasoup.createWorker({ logLevel: 'warn' });

	const onObserverClose = jest.fn();

	worker.observer.once('close', onObserverClose);
	worker.close();

	expect(onObserverClose).toHaveBeenCalledTimes(1);
	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(false);
}, 2000);

test('Worker emits "died" if worker process died unexpectedly', async () =>
{
	let onDied: ReturnType<typeof jest.fn>;
	let onObserverClose: ReturnType<typeof jest.fn>;

	worker = await mediasoup.createWorker({ logLevel: 'warn' });
	onDied = jest.fn();
	onObserverClose = jest.fn();

	worker.observer.once('close', onObserverClose);

	await new Promise<void>((resolve, reject) =>
	{
		worker.on('died', () =>
		{
			onDied();

			if (onObserverClose.mock.calls.length > 0)
			{
				reject(
					new Error('observer "close" event emitted before worker "died" event'));
			}
			else if (worker.closed)
			{
				resolve();
			}
			else
			{
				reject(new Error('worker.closed is false'));
			}
		});

		process.kill(worker.pid, 'SIGINT');
	});

	expect(onDied).toHaveBeenCalledTimes(1);
	expect(onObserverClose).toHaveBeenCalledTimes(1);
	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(true);

	// eslint-disable-next-line require-atomic-updates
	worker = await mediasoup.createWorker({ logLevel: 'warn' });
	onDied = jest.fn();
	onObserverClose = jest.fn();

	worker.observer.once('close', onObserverClose);

	await new Promise<void>((resolve, reject) =>
	{
		worker.on('died', () =>
		{
			onDied();

			if (onObserverClose.mock.calls.length > 0)
			{
				reject(
					new Error('observer "close" event emitted before worker "died" event'));
			}
			else if (worker.closed)
			{
				resolve();
			}
			else
			{
				reject(new Error('worker.closed is false'));
			}
		});

		process.kill(worker.pid, 'SIGTERM');
	});

	expect(onDied).toHaveBeenCalledTimes(1);
	expect(onObserverClose).toHaveBeenCalledTimes(1);
	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(true);

	// eslint-disable-next-line require-atomic-updates
	worker = await mediasoup.createWorker({ logLevel: 'warn' });
	onDied = jest.fn();
	onObserverClose = jest.fn();

	worker.observer.once('close', onObserverClose);

	await new Promise<void>((resolve, reject) =>
	{
		worker.on('died', () =>
		{
			onDied();

			if (onObserverClose.mock.calls.length > 0)
			{
				reject(
					new Error('observer "close" event emitted before worker "died" event'));
			}
			else if (worker.closed)
			{
				resolve();
			}
			else
			{
				reject(new Error('worker.closed is false'));
			}
		});

		process.kill(worker.pid, 'SIGKILL');
	});

	expect(onDied).toHaveBeenCalledTimes(1);
	expect(onObserverClose).toHaveBeenCalledTimes(1);
	expect(worker.closed).toBe(true);
	expect(worker.died).toBe(true);
}, 5000);

test('worker process ignores PIPE, HUP, ALRM, USR1 and USR2 signals', async () =>
{
	// Windows doesn't have some signals such as SIGPIPE, SIGALRM, SIGUSR1, SIGUSR2
	// so we just skip this test in Windows.
	if (os.platform() === 'win32')
	{
		return;
	}

	worker = await mediasoup.createWorker({ logLevel: 'warn' });

	await new Promise<void>((resolve, reject) =>
	{
		worker.on('died', reject);

		process.kill(worker.pid, 'SIGPIPE');
		process.kill(worker.pid, 'SIGHUP');
		process.kill(worker.pid, 'SIGALRM');
		process.kill(worker.pid, 'SIGUSR1');
		process.kill(worker.pid, 'SIGUSR2');

		setTimeout(() =>
		{
			expect(worker.closed).toBe(false);

			worker.close();
			resolve();
		}, 2000);
	});
}, 3000);
