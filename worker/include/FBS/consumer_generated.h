// automatically generated by the FlatBuffers compiler, do not modify


#ifndef FLATBUFFERS_GENERATED_CONSUMER_FBS_CONSUMER_H_
#define FLATBUFFERS_GENERATED_CONSUMER_FBS_CONSUMER_H_

#include "flatbuffers/flatbuffers.h"

namespace FBS {
namespace Consumer {

struct ConsumerLayers;

inline const flatbuffers::TypeTable *ConsumerLayersTypeTable();

FLATBUFFERS_MANUALLY_ALIGNED_STRUCT(1) ConsumerLayers FLATBUFFERS_FINAL_CLASS {
 private:
  uint8_t spatialLayer_;
  uint8_t temporalLayer_;

 public:
  static const flatbuffers::TypeTable *MiniReflectTypeTable() {
    return ConsumerLayersTypeTable();
  }
  ConsumerLayers()
      : spatialLayer_(0),
        temporalLayer_(0) {
  }
  ConsumerLayers(uint8_t _spatialLayer, uint8_t _temporalLayer)
      : spatialLayer_(flatbuffers::EndianScalar(_spatialLayer)),
        temporalLayer_(flatbuffers::EndianScalar(_temporalLayer)) {
  }
  uint8_t spatialLayer() const {
    return flatbuffers::EndianScalar(spatialLayer_);
  }
  uint8_t temporalLayer() const {
    return flatbuffers::EndianScalar(temporalLayer_);
  }
};
FLATBUFFERS_STRUCT_END(ConsumerLayers, 2);

inline const flatbuffers::TypeTable *ConsumerLayersTypeTable() {
  static const flatbuffers::TypeCode type_codes[] = {
    { flatbuffers::ET_UCHAR, 0, -1 },
    { flatbuffers::ET_UCHAR, 0, -1 }
  };
  static const int64_t values[] = { 0, 1, 2 };
  static const char * const names[] = {
    "spatialLayer",
    "temporalLayer"
  };
  static const flatbuffers::TypeTable tt = {
    flatbuffers::ST_STRUCT, 2, type_codes, nullptr, nullptr, values, names
  };
  return &tt;
}

}  // namespace Consumer
}  // namespace FBS

#endif  // FLATBUFFERS_GENERATED_CONSUMER_FBS_CONSUMER_H_
