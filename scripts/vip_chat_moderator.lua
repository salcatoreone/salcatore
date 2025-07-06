--[[
VIP Chat Moderator for SA:MP (Arizona RP)
Provides admin shortcut commands and automatic violation detection
]]

-- Command aliases
local command_aliases = {
    ["/caps"]  = "/mute %s 30 \208\154\208\176\208\191\209\129", -- \x? ??? to print 'Капс'
    ["/ovr"]   = "/mute %s 60 \208\158\208\177\209\133\208\190\208\180 \209\128\208\181\208\186\208\187\208\176\208\188\209\139 /vr",
    ["/oi"]    = "/mute %s 300 \208\158\209\129\208\186\208\190\209\128\208\177\208\187\208\181\208\189\208\184\208\181 \208\184\208\179\209\128\208\190\208\186\208\176/\208\190\208\178",
    ["/oa"]    = "/mute %s 300 \208\158\209\129\208\186\208\190\209\128\208\177\208\187\208\181\208\189\208\184\208\181 \208\176\208\180\208\188\208\184\208\189\208\184\209\129\209\130\209\128\208\176\209\130\208\190\209\128\208\176",
    ["/offt"]  = "/rmute %s 30 \208\158\209\132\209\132\209\130\208\190\208\191",
    ["/rcaps"] = "/rmute %s 30 \208\154\208\176\208\191\209\129",
    ["/or"]    = "/ban %s 30 \208\158\209\129\208\186\208\190\209\128\208\177\208\187\208\181\208\189\208\184\208\181 \209\128\208\190\208\180\208\189\209\139\209\133"
}

-- Insult word list (lowercase)
local insult_words = {"\208\180\209\131\209\128\208\176\208\186", "\208\184\208\180\208\184\208\190\209\130", "\208\188\208\176\209\130\209\140"}

-- Advertisement keywords (lowercase)
local adv_keywords = {"\208\186\209\131\208\191\208\187\209\142", "\208\191\209\128\208\190\208\180\208\176\208\188", "sell", "buy", "/findbiz", "\208\187\208\176\208\178\208\186\208\176", "\209\129\208\186\209\131\208\191\208\186\208\176", "\208\176\209\128\208\181\208\189\208\180\209\131\209\142", "\209\129\208\180\208\176\208\188"}

-- State for confirmation prompt
local pending_action = nil
local pending_timer = nil

-- Utility: send command to server
local function exec(cmd)
    if sendCommand then
        sendCommand(cmd)
    end
end

-- Helper to lower-case Russian/English string
local function lower(text)
    return string.lower(text)
end

-- Check for CAPS percentage
local function is_caps(text)
    local letters = text:gsub("[^%a\208\144-\208\191\209\128\208\181\209\143\208\184\209\143\208\181-\209\132\208\181\209\143\208\181-\209\143]", "")
    local total = #letters
    if total == 0 then return false end
    local upper = letters:gsub("[^%u\208\144-\208\175\208\152-\208\175]", "")
    return #upper / total >= 0.7
end

-- Detect advertisement bypass
local function is_adv_bypass(message)
    if message:find("^%[VIP ADV%]") then return false end
    if not (message:find("^%[VIP%]") or message:find("^%[FOREVER%]")) then
        return false
    end
    local lmsg = lower(message)
    for _, w in ipairs(adv_keywords) do
        if lmsg:find(w) then
            return true
        end
    end
    return false
end

-- Detect insults
local function contains_insult(message)
    local lmsg = lower(message)
    for _, w in ipairs(insult_words) do
        if lmsg:find(w) then
            return true
        end
    end
    return false
end

-- Show confirmation prompt
local function prompt(player, reason, command)
    print("\226\157\153 \208\158\208\177\208\189\208\176\209\128\209\131\208\182\208\181\208\189\208\190 \208\178\208\190\208\183\208\188\208\190\208\182\208\189\208\190\208\181 \208\189\208\176\209\128\209\131\209\136\208\181\208\189\208\184\208\181: " .. reason .. " \208\190\209\130 " .. player.name .. ". \208\159\208\190\208\180\209\130\208\178\208\181\209\128\208\180\208\184\209\130\208\181\209\140: /yyy \226\128\148 \208\190\209\130\208\188\208\181\208\189\208\176: /nnn")
    pending_action = command
    if pending_timer then
        killTimer(pending_timer)
    end
    pending_timer = setTimer(function()
        pending_action = nil
    end, 10000, 1)
end

-- Hook for chat messages
function onChatMessage(player, message)
    if is_adv_bypass(message) then
        prompt(player, "\208\158\208\177\209\133\208\190\208\180 \209\128\208\181\208\186\208\187\208\176\208\188\209\139 /vr", string.format("/mute %d 60 \208\158\208\177\209\133\208\190\208\180 \209\128\208\181\208\186\208\187\208\176\208\188\209\139 /vr", player.id))
        return
    end
    if is_caps(message) then
        prompt(player, "\208\154\208\176\208\191\209\129", string.format("/mute %d 30 \208\154\208\176\208\191\209\129", player.id))
        return
    end
    if contains_insult(message) then
        prompt(player, "\208\158\209\129\208\186\208\190\209\128\208\177\208\187\208\181\208\189\208\184\208\181", string.format("/mute %d 300 \208\158\209\129\208\186\208\190\209\128\208\177\208\187\208\181\208\189\208\184\208\181", player.id))
        return
    end
end

-- Admin typed command handler
function onAdminCommand(text)
    local args = {}
    for word in text:gmatch("%S+") do
        table.insert(args, word)
    end
    local alias = command_aliases[args[1]]
    if alias and args[2] then
        exec(alias:format(args[2]))
        return false
    end
    if text == "/yyy" and pending_action then
        exec(pending_action)
        pending_action = nil
        if pending_timer then killTimer(pending_timer) end
        return false
    elseif text == "/nnn" then
        pending_action = nil
        if pending_timer then killTimer(pending_timer) end
        return false
    end
    return true
end

