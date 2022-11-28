#define MS_CLASS "RTC::DirectTransport"
// #define MS_LOG_DEV_LEVEL 3

#include "RTC/DirectTransport.hpp"
#include "Logger.hpp"
#include "MediaSoupErrors.hpp"

namespace RTC
{
	/* Instance methods. */

	// NOLINTNEXTLINE(cppcoreguidelines-pro-type-member-init)
	DirectTransport::DirectTransport(
	  RTC::Shared* shared,
	  const std::string& id,
	  RTC::Transport::Listener* listener,
	  const FBS::DirectTransport::DirectTransportOptions* options)
	  : RTC::Transport::Transport(shared, id, listener, options->base())
	{
		MS_TRACE();

		// NOTE: This may throw.
		this->shared->channelMessageRegistrator->RegisterHandler(
		  this->id,
		  /*channelRequestHandler*/ this,
		  /*payloadChannelRequestHandler*/ this,
		  /*payloadChannelNotificationHandler*/ this);
	}

	DirectTransport::~DirectTransport()
	{
		MS_TRACE();

		this->shared->channelMessageRegistrator->UnregisterHandler(this->id);
	}

	flatbuffers::Offset<FBS::Transport::DumpResponse> DirectTransport::FillBuffer(
	  flatbuffers::FlatBufferBuilder& builder) const
	{
		// Add base transport dump.
		auto base = Transport::FillBuffer(builder);

		auto directTransportDump = FBS::Transport::CreateDirectTransportDump(builder, base);

		return FBS::Transport::CreateDumpResponse(
		  builder, FBS::Transport::TransportDumpData::DirectTransportDump, directTransportDump.Union());
	}

	void DirectTransport::FillJsonStats(json& jsonArray)
	{
		MS_TRACE();

		// Call the parent method.
		RTC::Transport::FillJsonStats(jsonArray);

		auto& jsonObject = jsonArray[0];

		// Add type.
		jsonObject["type"] = "direct-transport";
	}

	void DirectTransport::HandleRequest(Channel::ChannelRequest* request)
	{
		MS_TRACE();

		// Pass it to the parent class.
		RTC::Transport::HandleRequest(request);
	}

	void DirectTransport::HandleNotification(PayloadChannel::PayloadChannelNotification* notification)
	{
		MS_TRACE();

		switch (notification->event)
		{
			case PayloadChannel::PayloadChannelNotification::Event::TRANSPORT_SEND_RTCP:
			{
				auto body = notification->data->body_as<FBS::Transport::SendRtcpNotification>();
				auto len  = body->data()->size();

				// Increase receive transmission.
				RTC::Transport::DataReceived(len);

				if (len > RTC::MtuSize + 100)
				{
					MS_WARN_TAG(rtp, "given RTCP packet exceeds maximum size [len:%i]", len);

					return;
				}

				RTC::RTCP::Packet* packet = RTC::RTCP::Packet::Parse(body->data()->data(), len);

				if (!packet)
				{
					MS_WARN_TAG(rtcp, "received data is not a valid RTCP compound or single packet");

					return;
				}

				// Pass the packet to the parent transport.
				RTC::Transport::ReceiveRtcpPacket(packet);

				break;
			}

			default:
			{
				// Pass it to the parent class.
				RTC::Transport::HandleNotification(notification);
			}
		}
	}

	inline bool DirectTransport::IsConnected() const
	{
		return true;
	}

	void DirectTransport::SendRtpPacket(
	  RTC::Consumer* consumer, RTC::RtpPacket* packet, RTC::Transport::onSendCallback* cb)
	{
		MS_TRACE();

		if (!consumer)
		{
			MS_WARN_TAG(rtp, "cannot send RTP packet not associated to a Consumer");

			return;
		}

		const uint8_t* data = packet->GetData();
		size_t len          = packet->GetSize();

		// Notify the Node DirectTransport.
		this->shared->payloadChannelNotifier->Emit(consumer->id, "rtp", data, len);

		if (cb)
		{
			(*cb)(true);
			delete cb;
		}

		// Increase send transmission.
		RTC::Transport::DataSent(len);
	}

	void DirectTransport::SendRtcpPacket(RTC::RTCP::Packet* packet)
	{
		MS_TRACE();

		const uint8_t* data = packet->GetData();
		size_t len          = packet->GetSize();

		// Notify the Node DirectTransport.
		this->shared->payloadChannelNotifier->Emit(this->id, "rtcp", data, len);

		// Increase send transmission.
		RTC::Transport::DataSent(len);
	}

	void DirectTransport::SendRtcpCompoundPacket(RTC::RTCP::CompoundPacket* packet)
	{
		MS_TRACE();

		packet->Serialize(RTC::RTCP::Buffer);

		const uint8_t* data = packet->GetData();
		size_t len          = packet->GetSize();

		// Notify the Node DirectTransport.
		this->shared->payloadChannelNotifier->Emit(this->id, "rtcp", data, len);

		// Increase send transmission.
		RTC::Transport::DataSent(len);
	}

	void DirectTransport::SendMessage(
	  RTC::DataConsumer* dataConsumer, uint32_t ppid, const uint8_t* msg, size_t len, onQueuedCallback* cb)
	{
		MS_TRACE();

		// Notify the Node DirectTransport.
		json data = json::object();

		data["ppid"] = ppid;

		this->shared->payloadChannelNotifier->Emit(dataConsumer->id, "message", data, msg, len);

		// Increase send transmission.
		RTC::Transport::DataSent(len);
	}

	void DirectTransport::SendSctpData(const uint8_t* /*data*/, size_t /*len*/)
	{
		MS_TRACE();

		// Do nothing.
	}

	void DirectTransport::RecvStreamClosed(uint32_t /*ssrc*/)
	{
		MS_TRACE();

		// Do nothing.
	}

	void DirectTransport::SendStreamClosed(uint32_t /*ssrc*/)
	{
		MS_TRACE();

		// Do nothing.
	}
} // namespace RTC
