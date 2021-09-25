function fib(n)
  if n < 2 then
    return n;
  end

  return fib(n - 1) + fib(n - 2);
end

print(fib(0));
print(fib(1));
print(fib(2));
print(fib(3));
print(fib(4));
print(fib(5));
