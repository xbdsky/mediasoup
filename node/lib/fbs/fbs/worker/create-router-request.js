"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRouterRequestT = exports.CreateRouterRequest = void 0;
const flatbuffers = require("flatbuffers");
class CreateRouterRequest {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsCreateRouterRequest(bb, obj) {
        return (obj || new CreateRouterRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsCreateRouterRequest(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new CreateRouterRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    routerId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startCreateRouterRequest(builder) {
        builder.startObject(1);
    }
    static addRouterId(builder, routerIdOffset) {
        builder.addFieldOffset(0, routerIdOffset, 0);
    }
    static endCreateRouterRequest(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // router_id
        return offset;
    }
    static createCreateRouterRequest(builder, routerIdOffset) {
        CreateRouterRequest.startCreateRouterRequest(builder);
        CreateRouterRequest.addRouterId(builder, routerIdOffset);
        return CreateRouterRequest.endCreateRouterRequest(builder);
    }
    unpack() {
        return new CreateRouterRequestT(this.routerId());
    }
    unpackTo(_o) {
        _o.routerId = this.routerId();
    }
}
exports.CreateRouterRequest = CreateRouterRequest;
class CreateRouterRequestT {
    routerId;
    constructor(routerId = null) {
        this.routerId = routerId;
    }
    pack(builder) {
        const routerId = (this.routerId !== null ? builder.createString(this.routerId) : 0);
        return CreateRouterRequest.createCreateRouterRequest(builder, routerId);
    }
}
exports.CreateRouterRequestT = CreateRouterRequestT;
