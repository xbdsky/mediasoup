// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class WebRtcServerClose {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):WebRtcServerClose {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsWebRtcServerClose(bb:flatbuffers.ByteBuffer, obj?:WebRtcServerClose):WebRtcServerClose {
  return (obj || new WebRtcServerClose()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsWebRtcServerClose(bb:flatbuffers.ByteBuffer, obj?:WebRtcServerClose):WebRtcServerClose {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new WebRtcServerClose()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

webRtcServerId():string|null
webRtcServerId(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
webRtcServerId(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startWebRtcServerClose(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addWebRtcServerId(builder:flatbuffers.Builder, webRtcServerIdOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, webRtcServerIdOffset, 0);
}

static endWebRtcServerClose(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  builder.requiredField(offset, 4) // web_rtc_server_id
  return offset;
}

static createWebRtcServerClose(builder:flatbuffers.Builder, webRtcServerIdOffset:flatbuffers.Offset):flatbuffers.Offset {
  WebRtcServerClose.startWebRtcServerClose(builder);
  WebRtcServerClose.addWebRtcServerId(builder, webRtcServerIdOffset);
  return WebRtcServerClose.endWebRtcServerClose(builder);
}

unpack(): WebRtcServerCloseT {
  return new WebRtcServerCloseT(
    this.webRtcServerId()
  );
}


unpackTo(_o: WebRtcServerCloseT): void {
  _o.webRtcServerId = this.webRtcServerId();
}
}

export class WebRtcServerCloseT {
constructor(
  public webRtcServerId: string|Uint8Array|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const webRtcServerId = (this.webRtcServerId !== null ? builder.createString(this.webRtcServerId!) : 0);

  return WebRtcServerClose.createWebRtcServerClose(builder,
    webRtcServerId
  );
}
}
