local MockMessagingService = {}

local topics = {}

function MockMessagingService:PublishAsync(topic, message)
	local topic = topics[topic]
	if topic then
		topic:Fire(
			{
				Sent = tick(),
				Data = message
			}
		)
	end
end

function MockMessagingService:SubscribeAsync(topic, callback)
	local topic = topics[topic]
	if not topic then
		topic = Instance.new("BindableEvent", script)
		topic.Name = topic
	end

	return topic.Event.Connect(callback)
end

return MockMessagingService
