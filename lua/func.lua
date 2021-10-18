local function max(...)
  local args = { ... }
  local val, idx
  for i = 1, #args do
    if val == nil or args[i] > val then
      val, idx = args[i], i
    end
  end
  return val, idx
end

local function assert(v)
  if not v then print('assertion failed') end
end

local v1 = max(3, 9, 7, 128, 35)
print(v1)
assert(v1 == 128)
local v2, i2 = max(3, 9, 7, 128, 35)
print(v2, i2)
assert(v2 == 128 and i2 == 4)
local v3, i3 = max(max(3, 9, 7, 128, 35))
print(v3, i3)
assert(v3 == 128 and i3 == 1)
local t = {max(3, 9, 7, 128, 35)}
print(t[1], t[2])
assert(t[1] == 128 and t[2] == 4)
