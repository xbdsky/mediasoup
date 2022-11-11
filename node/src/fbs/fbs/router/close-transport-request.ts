// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class CloseTransportRequest {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):CloseTransportRequest {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsCloseTransportRequest(bb:flatbuffers.ByteBuffer, obj?:CloseTransportRequest):CloseTransportRequest {
  return (obj || new CloseTransportRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsCloseTransportRequest(bb:flatbuffers.ByteBuffer, obj?:CloseTransportRequest):CloseTransportRequest {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new CloseTransportRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

transportId():string|null
transportId(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
transportId(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startCloseTransportRequest(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addTransportId(builder:flatbuffers.Builder, transportIdOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, transportIdOffset, 0);
}

static endCloseTransportRequest(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  builder.requiredField(offset, 4) // transport_id
  return offset;
}

static createCloseTransportRequest(builder:flatbuffers.Builder, transportIdOffset:flatbuffers.Offset):flatbuffers.Offset {
  CloseTransportRequest.startCloseTransportRequest(builder);
  CloseTransportRequest.addTransportId(builder, transportIdOffset);
  return CloseTransportRequest.endCloseTransportRequest(builder);
}

unpack(): CloseTransportRequestT {
  return new CloseTransportRequestT(
    this.transportId()
  );
}


unpackTo(_o: CloseTransportRequestT): void {
  _o.transportId = this.transportId();
}
}

export class CloseTransportRequestT {
constructor(
  public transportId: string|Uint8Array|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const transportId = (this.transportId !== null ? builder.createString(this.transportId!) : 0);

  return CloseTransportRequest.createCloseTransportRequest(builder,
    transportId
  );
}
}
