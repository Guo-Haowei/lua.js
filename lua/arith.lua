local a, b, c, d, e, f, g, h, i, j, k, l, m, n, o
local tmp1, tmp2
a = 4
b = 5
c = a + b -- 9
d = c * b -- 45
e = d % a -- 1
f = d / a -- 11.25
g = d // a -- 11
h = a - b -- -1
tmp1 = 16
tmp2 = 15
i = tmp1 & tmp2 -- 0
tmp1 = 0xF0
tmp2 = 0x0F
j = tmp1 | tmp2 -- 0xFF
k = tmp1 ~ tmp2 -- 0xFF
l = e << 3 -- 8
m = c >> 3 -- 1
n = -l -- -8
o = l ^ c -- 134217728
