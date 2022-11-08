import { BaseTransportDump, Transport, TransportListenIp, TransportTuple, TransportEvents, TransportObserverEvents, TransportConstructorOptions, SctpState } from './Transport';
import { SctpParameters, NumSctpStreams } from './SctpParameters';
import { SrtpParameters, SrtpCryptoSuite } from './SrtpParameters';
import * as FbsTransport from './fbs/transport_generated';
export declare type PlainTransportOptions = {
    /**
     * Listening IP address.
     */
    listenIp: TransportListenIp | string;
    /**
     * Fixed port to listen on instead of selecting automatically from Worker's port
     * range.
     */
    port?: number;
    /**
     * Use RTCP-mux (RTP and RTCP in the same port). Default true.
     */
    rtcpMux?: boolean;
    /**
     * Whether remote IP:port should be auto-detected based on first RTP/RTCP
     * packet received. If enabled, connect() method must not be called unless
     * SRTP is enabled. If so, it must be called with just remote SRTP parameters.
     * Default false.
     */
    comedia?: boolean;
    /**
     * Create a SCTP association. Default false.
     */
    enableSctp?: boolean;
    /**
     * SCTP streams number.
     */
    numSctpStreams?: NumSctpStreams;
    /**
     * Maximum allowed size for SCTP messages sent by DataProducers.
     * Default 262144.
     */
    maxSctpMessageSize?: number;
    /**
     * Maximum SCTP send buffer used by DataConsumers.
     * Default 262144.
     */
    sctpSendBufferSize?: number;
    /**
     * Enable SRTP. For this to work, connect() must be called
     * with remote SRTP parameters. Default false.
     */
    enableSrtp?: boolean;
    /**
     * The SRTP crypto suite to be used if enableSrtp is set. Default
     * 'AES_CM_128_HMAC_SHA1_80'.
     */
    srtpCryptoSuite?: SrtpCryptoSuite;
    /**
     * Custom application data.
     */
    appData?: Record<string, unknown>;
};
export declare type PlainTransportStat = {
    type: string;
    transportId: string;
    timestamp: number;
    sctpState?: SctpState;
    bytesReceived: number;
    recvBitrate: number;
    bytesSent: number;
    sendBitrate: number;
    rtpBytesReceived: number;
    rtpRecvBitrate: number;
    rtpBytesSent: number;
    rtpSendBitrate: number;
    rtxBytesReceived: number;
    rtxRecvBitrate: number;
    rtxBytesSent: number;
    rtxSendBitrate: number;
    probationBytesSent: number;
    probationSendBitrate: number;
    availableOutgoingBitrate?: number;
    availableIncomingBitrate?: number;
    maxIncomingBitrate?: number;
    rtcpMux: boolean;
    comedia: boolean;
    tuple: TransportTuple;
    rtcpTuple?: TransportTuple;
};
export declare type PlainTransportEvents = TransportEvents & {
    tuple: [TransportTuple];
    rtcptuple: [TransportTuple];
    sctpstatechange: [SctpState];
};
export declare type PlainTransportObserverEvents = TransportObserverEvents & {
    tuple: [TransportTuple];
    rtcptuple: [TransportTuple];
    sctpstatechange: [SctpState];
};
declare type PlainTransportConstructorOptions = TransportConstructorOptions & {
    data: PlainTransportData;
};
export declare type PlainTransportData = {
    rtcpMux?: boolean;
    comedia?: boolean;
    tuple: TransportTuple;
    rtcpTuple?: TransportTuple;
    sctpParameters?: SctpParameters;
    sctpState?: SctpState;
    srtpParameters?: SrtpParameters;
};
export declare class PlainTransport extends Transport<PlainTransportEvents, PlainTransportObserverEvents> {
    #private;
    /**
     * @private
     */
    constructor(options: PlainTransportConstructorOptions);
    /**
     * Transport tuple.
     */
    get tuple(): TransportTuple;
    /**
     * Transport RTCP tuple.
     */
    get rtcpTuple(): TransportTuple | undefined;
    /**
     * SCTP parameters.
     */
    get sctpParameters(): SctpParameters | undefined;
    /**
     * SCTP state.
     */
    get sctpState(): SctpState | undefined;
    /**
     * SRTP parameters.
     */
    get srtpParameters(): SrtpParameters | undefined;
    /**
     * Close the PlainTransport.
     *
     * @override
     */
    close(): void;
    /**
     * Router was closed.
     *
     * @private
     * @override
     */
    routerClosed(): void;
    /**
     * Dump Transport.
     */
    dump(): Promise<any>;
    /**
     * Get PlainTransport stats.
     *
     * @override
     */
    getStats(): Promise<PlainTransportStat[]>;
    /**
     * Provide the PlainTransport remote parameters.
     *
     * @override
     */
    connect({ ip, port, rtcpPort, srtpParameters }: {
        ip?: string;
        port?: number;
        rtcpPort?: number;
        srtpParameters?: SrtpParameters;
    }): Promise<void>;
    private handleWorkerNotifications;
}
declare type PlainTransportDump = BaseTransportDump & {
    rtcMux: boolean;
    comedia: boolean;
    tuple: TransportTuple;
    rtcpTuple?: TransportTuple;
    srtpParameters?: SrtpParameters;
};
export declare function parsePlainTransportDump(binary: FbsTransport.PlainTransportDump): PlainTransportDump;
export {};
//# sourceMappingURL=PlainTransport.d.ts.map