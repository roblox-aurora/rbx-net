local Signal = {}
Signal.__index = Signal

function Signal.new()
	return setmetatable({
		Bindable = Instance.new("BindableEvent");
	}, Signal)
end

function Signal:Connect(Callback)
	return self.Bindable.Event:Connect(function(GetArguments)
		Callback(GetArguments())
	end)
end

function Signal:Fire(...)
	local Arguments = { ... }
	local n = select("#", ...)

	self.Bindable:Fire(function()
		return table.unpack(Arguments, 1, n)
	end)
end

function Signal:Wait()
	return self.Bindable.Event:Wait()()
end

function Signal:Destroy()
	self.Bindable:Destroy()
end

return Signal
