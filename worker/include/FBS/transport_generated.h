// automatically generated by the FlatBuffers compiler, do not modify


#ifndef FLATBUFFERS_GENERATED_TRANSPORT_FBS_TRANSPORT_H_
#define FLATBUFFERS_GENERATED_TRANSPORT_FBS_TRANSPORT_H_

#include "flatbuffers/flatbuffers.h"

#include "rtpParameters_generated.h"

namespace FBS {
namespace Transport {

struct ConsumeRequest;
struct ConsumeRequestBuilder;

struct ConsumeResponse;
struct ConsumeResponseBuilder;

inline const flatbuffers::TypeTable *ConsumeRequestTypeTable();

inline const flatbuffers::TypeTable *ConsumeResponseTypeTable();

struct ConsumeRequest FLATBUFFERS_FINAL_CLASS : private flatbuffers::Table {
  typedef ConsumeRequestBuilder Builder;
  static const flatbuffers::TypeTable *MiniReflectTypeTable() {
    return ConsumeRequestTypeTable();
  }
  enum FlatBuffersVTableOffset FLATBUFFERS_VTABLE_UNDERLYING_TYPE {
    VT_CONSUMERID = 4,
    VT_PRODUCERID = 6,
    VT_KIND = 8,
    VT_RTPPARAMETERS = 10,
    VT_TYPE = 12,
    VT_CONSUMABLERTPENCODINGS = 14,
    VT_PAUSED = 16,
    VT_IGNOREDTX = 18
  };
  const flatbuffers::String *consumerId() const {
    return GetPointer<const flatbuffers::String *>(VT_CONSUMERID);
  }
  const flatbuffers::String *producerId() const {
    return GetPointer<const flatbuffers::String *>(VT_PRODUCERID);
  }
  FBS::RtpParameters::MediaKind kind() const {
    return static_cast<FBS::RtpParameters::MediaKind>(GetField<uint8_t>(VT_KIND, 0));
  }
  const FBS::RtpParameters::RtpParameters *rtpParameters() const {
    return GetPointer<const FBS::RtpParameters::RtpParameters *>(VT_RTPPARAMETERS);
  }
  FBS::RtpParameters::Type type() const {
    return static_cast<FBS::RtpParameters::Type>(GetField<uint8_t>(VT_TYPE, 0));
  }
  const flatbuffers::Vector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>> *consumableRtpEncodings() const {
    return GetPointer<const flatbuffers::Vector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>> *>(VT_CONSUMABLERTPENCODINGS);
  }
  bool paused() const {
    return GetField<uint8_t>(VT_PAUSED, 0) != 0;
  }
  bool ignoreDtx() const {
    return GetField<uint8_t>(VT_IGNOREDTX, 0) != 0;
  }
  bool Verify(flatbuffers::Verifier &verifier) const {
    return VerifyTableStart(verifier) &&
           VerifyOffsetRequired(verifier, VT_CONSUMERID) &&
           verifier.VerifyString(consumerId()) &&
           VerifyOffsetRequired(verifier, VT_PRODUCERID) &&
           verifier.VerifyString(producerId()) &&
           VerifyField<uint8_t>(verifier, VT_KIND, 1) &&
           VerifyOffsetRequired(verifier, VT_RTPPARAMETERS) &&
           verifier.VerifyTable(rtpParameters()) &&
           VerifyField<uint8_t>(verifier, VT_TYPE, 1) &&
           VerifyOffsetRequired(verifier, VT_CONSUMABLERTPENCODINGS) &&
           verifier.VerifyVector(consumableRtpEncodings()) &&
           verifier.VerifyVectorOfTables(consumableRtpEncodings()) &&
           VerifyField<uint8_t>(verifier, VT_PAUSED, 1) &&
           VerifyField<uint8_t>(verifier, VT_IGNOREDTX, 1) &&
           verifier.EndTable();
  }
};

struct ConsumeRequestBuilder {
  typedef ConsumeRequest Table;
  flatbuffers::FlatBufferBuilder &fbb_;
  flatbuffers::uoffset_t start_;
  void add_consumerId(flatbuffers::Offset<flatbuffers::String> consumerId) {
    fbb_.AddOffset(ConsumeRequest::VT_CONSUMERID, consumerId);
  }
  void add_producerId(flatbuffers::Offset<flatbuffers::String> producerId) {
    fbb_.AddOffset(ConsumeRequest::VT_PRODUCERID, producerId);
  }
  void add_kind(FBS::RtpParameters::MediaKind kind) {
    fbb_.AddElement<uint8_t>(ConsumeRequest::VT_KIND, static_cast<uint8_t>(kind), 0);
  }
  void add_rtpParameters(flatbuffers::Offset<FBS::RtpParameters::RtpParameters> rtpParameters) {
    fbb_.AddOffset(ConsumeRequest::VT_RTPPARAMETERS, rtpParameters);
  }
  void add_type(FBS::RtpParameters::Type type) {
    fbb_.AddElement<uint8_t>(ConsumeRequest::VT_TYPE, static_cast<uint8_t>(type), 0);
  }
  void add_consumableRtpEncodings(flatbuffers::Offset<flatbuffers::Vector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>>> consumableRtpEncodings) {
    fbb_.AddOffset(ConsumeRequest::VT_CONSUMABLERTPENCODINGS, consumableRtpEncodings);
  }
  void add_paused(bool paused) {
    fbb_.AddElement<uint8_t>(ConsumeRequest::VT_PAUSED, static_cast<uint8_t>(paused), 0);
  }
  void add_ignoreDtx(bool ignoreDtx) {
    fbb_.AddElement<uint8_t>(ConsumeRequest::VT_IGNOREDTX, static_cast<uint8_t>(ignoreDtx), 0);
  }
  explicit ConsumeRequestBuilder(flatbuffers::FlatBufferBuilder &_fbb)
        : fbb_(_fbb) {
    start_ = fbb_.StartTable();
  }
  flatbuffers::Offset<ConsumeRequest> Finish() {
    const auto end = fbb_.EndTable(start_);
    auto o = flatbuffers::Offset<ConsumeRequest>(end);
    fbb_.Required(o, ConsumeRequest::VT_CONSUMERID);
    fbb_.Required(o, ConsumeRequest::VT_PRODUCERID);
    fbb_.Required(o, ConsumeRequest::VT_RTPPARAMETERS);
    fbb_.Required(o, ConsumeRequest::VT_CONSUMABLERTPENCODINGS);
    return o;
  }
};

inline flatbuffers::Offset<ConsumeRequest> CreateConsumeRequest(
    flatbuffers::FlatBufferBuilder &_fbb,
    flatbuffers::Offset<flatbuffers::String> consumerId = 0,
    flatbuffers::Offset<flatbuffers::String> producerId = 0,
    FBS::RtpParameters::MediaKind kind = FBS::RtpParameters::MediaKind::ALL,
    flatbuffers::Offset<FBS::RtpParameters::RtpParameters> rtpParameters = 0,
    FBS::RtpParameters::Type type = FBS::RtpParameters::Type::NONE,
    flatbuffers::Offset<flatbuffers::Vector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>>> consumableRtpEncodings = 0,
    bool paused = false,
    bool ignoreDtx = false) {
  ConsumeRequestBuilder builder_(_fbb);
  builder_.add_consumableRtpEncodings(consumableRtpEncodings);
  builder_.add_rtpParameters(rtpParameters);
  builder_.add_producerId(producerId);
  builder_.add_consumerId(consumerId);
  builder_.add_ignoreDtx(ignoreDtx);
  builder_.add_paused(paused);
  builder_.add_type(type);
  builder_.add_kind(kind);
  return builder_.Finish();
}

inline flatbuffers::Offset<ConsumeRequest> CreateConsumeRequestDirect(
    flatbuffers::FlatBufferBuilder &_fbb,
    const char *consumerId = nullptr,
    const char *producerId = nullptr,
    FBS::RtpParameters::MediaKind kind = FBS::RtpParameters::MediaKind::ALL,
    flatbuffers::Offset<FBS::RtpParameters::RtpParameters> rtpParameters = 0,
    FBS::RtpParameters::Type type = FBS::RtpParameters::Type::NONE,
    const std::vector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>> *consumableRtpEncodings = nullptr,
    bool paused = false,
    bool ignoreDtx = false) {
  auto consumerId__ = consumerId ? _fbb.CreateString(consumerId) : 0;
  auto producerId__ = producerId ? _fbb.CreateString(producerId) : 0;
  auto consumableRtpEncodings__ = consumableRtpEncodings ? _fbb.CreateVector<flatbuffers::Offset<FBS::RtpParameters::RtpEncodingParameters>>(*consumableRtpEncodings) : 0;
  return FBS::Transport::CreateConsumeRequest(
      _fbb,
      consumerId__,
      producerId__,
      kind,
      rtpParameters,
      type,
      consumableRtpEncodings__,
      paused,
      ignoreDtx);
}

struct ConsumeResponse FLATBUFFERS_FINAL_CLASS : private flatbuffers::Table {
  typedef ConsumeResponseBuilder Builder;
  static const flatbuffers::TypeTable *MiniReflectTypeTable() {
    return ConsumeResponseTypeTable();
  }
  enum FlatBuffersVTableOffset FLATBUFFERS_VTABLE_UNDERLYING_TYPE {
    VT_PAUSED = 4,
    VT_PRODUCERPAUSED = 6,
    VT_SCORE = 8
  };
  bool paused() const {
    return GetField<uint8_t>(VT_PAUSED, 0) != 0;
  }
  bool producerPaused() const {
    return GetField<uint8_t>(VT_PRODUCERPAUSED, 0) != 0;
  }
  uint8_t score() const {
    return GetField<uint8_t>(VT_SCORE, 0);
  }
  bool Verify(flatbuffers::Verifier &verifier) const {
    return VerifyTableStart(verifier) &&
           VerifyField<uint8_t>(verifier, VT_PAUSED, 1) &&
           VerifyField<uint8_t>(verifier, VT_PRODUCERPAUSED, 1) &&
           VerifyField<uint8_t>(verifier, VT_SCORE, 1) &&
           verifier.EndTable();
  }
};

struct ConsumeResponseBuilder {
  typedef ConsumeResponse Table;
  flatbuffers::FlatBufferBuilder &fbb_;
  flatbuffers::uoffset_t start_;
  void add_paused(bool paused) {
    fbb_.AddElement<uint8_t>(ConsumeResponse::VT_PAUSED, static_cast<uint8_t>(paused), 0);
  }
  void add_producerPaused(bool producerPaused) {
    fbb_.AddElement<uint8_t>(ConsumeResponse::VT_PRODUCERPAUSED, static_cast<uint8_t>(producerPaused), 0);
  }
  void add_score(uint8_t score) {
    fbb_.AddElement<uint8_t>(ConsumeResponse::VT_SCORE, score, 0);
  }
  explicit ConsumeResponseBuilder(flatbuffers::FlatBufferBuilder &_fbb)
        : fbb_(_fbb) {
    start_ = fbb_.StartTable();
  }
  flatbuffers::Offset<ConsumeResponse> Finish() {
    const auto end = fbb_.EndTable(start_);
    auto o = flatbuffers::Offset<ConsumeResponse>(end);
    return o;
  }
};

inline flatbuffers::Offset<ConsumeResponse> CreateConsumeResponse(
    flatbuffers::FlatBufferBuilder &_fbb,
    bool paused = false,
    bool producerPaused = false,
    uint8_t score = 0) {
  ConsumeResponseBuilder builder_(_fbb);
  builder_.add_score(score);
  builder_.add_producerPaused(producerPaused);
  builder_.add_paused(paused);
  return builder_.Finish();
}

inline const flatbuffers::TypeTable *ConsumeRequestTypeTable() {
  static const flatbuffers::TypeCode type_codes[] = {
    { flatbuffers::ET_STRING, 0, -1 },
    { flatbuffers::ET_STRING, 0, -1 },
    { flatbuffers::ET_UCHAR, 0, 0 },
    { flatbuffers::ET_SEQUENCE, 0, 1 },
    { flatbuffers::ET_UCHAR, 0, 2 },
    { flatbuffers::ET_SEQUENCE, 1, 3 },
    { flatbuffers::ET_BOOL, 0, -1 },
    { flatbuffers::ET_BOOL, 0, -1 }
  };
  static const flatbuffers::TypeFunction type_refs[] = {
    FBS::RtpParameters::MediaKindTypeTable,
    FBS::RtpParameters::RtpParametersTypeTable,
    FBS::RtpParameters::TypeTypeTable,
    FBS::RtpParameters::RtpEncodingParametersTypeTable
  };
  static const char * const names[] = {
    "consumerId",
    "producerId",
    "kind",
    "rtpParameters",
    "type",
    "consumableRtpEncodings",
    "paused",
    "ignoreDtx"
  };
  static const flatbuffers::TypeTable tt = {
    flatbuffers::ST_TABLE, 8, type_codes, type_refs, nullptr, nullptr, names
  };
  return &tt;
}

inline const flatbuffers::TypeTable *ConsumeResponseTypeTable() {
  static const flatbuffers::TypeCode type_codes[] = {
    { flatbuffers::ET_BOOL, 0, -1 },
    { flatbuffers::ET_BOOL, 0, -1 },
    { flatbuffers::ET_UCHAR, 0, -1 }
  };
  static const char * const names[] = {
    "paused",
    "producerPaused",
    "score"
  };
  static const flatbuffers::TypeTable tt = {
    flatbuffers::ST_TABLE, 3, type_codes, nullptr, nullptr, nullptr, names
  };
  return &tt;
}

inline const FBS::Transport::ConsumeRequest *GetConsumeRequest(const void *buf) {
  return flatbuffers::GetRoot<FBS::Transport::ConsumeRequest>(buf);
}

inline const FBS::Transport::ConsumeRequest *GetSizePrefixedConsumeRequest(const void *buf) {
  return flatbuffers::GetSizePrefixedRoot<FBS::Transport::ConsumeRequest>(buf);
}

inline bool VerifyConsumeRequestBuffer(
    flatbuffers::Verifier &verifier) {
  return verifier.VerifyBuffer<FBS::Transport::ConsumeRequest>(nullptr);
}

inline bool VerifySizePrefixedConsumeRequestBuffer(
    flatbuffers::Verifier &verifier) {
  return verifier.VerifySizePrefixedBuffer<FBS::Transport::ConsumeRequest>(nullptr);
}

inline void FinishConsumeRequestBuffer(
    flatbuffers::FlatBufferBuilder &fbb,
    flatbuffers::Offset<FBS::Transport::ConsumeRequest> root) {
  fbb.Finish(root);
}

inline void FinishSizePrefixedConsumeRequestBuffer(
    flatbuffers::FlatBufferBuilder &fbb,
    flatbuffers::Offset<FBS::Transport::ConsumeRequest> root) {
  fbb.FinishSizePrefixed(root);
}

}  // namespace Transport
}  // namespace FBS

#endif  // FLATBUFFERS_GENERATED_TRANSPORT_FBS_TRANSPORT_H_
