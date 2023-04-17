#define MS_CLASS "RTC::RtcpFeedback"
// #define MS_LOG_DEV_LEVEL 3

#include "Logger.hpp"
#include "MediaSoupErrors.hpp"
#include "RTC/RtpDictionaries.hpp"

namespace RTC
{
	/* Instance methods. */

	RtcpFeedback::RtcpFeedback(const FBS::RtpParameters::RtcpFeedback* data)
	{
		MS_TRACE();

		this->type = data->type()->str();

		// parameter is optional.
		if (flatbuffers::IsFieldPresent(data, FBS::RtpParameters::RtcpFeedback::VT_PARAMETER))
			this->parameter = data->parameter()->str();
	}

	flatbuffers::Offset<FBS::RtpParameters::RtcpFeedback> RtcpFeedback::FillBuffer(
	  flatbuffers::FlatBufferBuilder& builder) const
	{
		MS_TRACE();

		return FBS::RtpParameters::CreateRtcpFeedbackDirect(
		  builder, this->type.c_str(), this->parameter.length() > 0 ? this->parameter.c_str() : nullptr);
	}
} // namespace RTC
