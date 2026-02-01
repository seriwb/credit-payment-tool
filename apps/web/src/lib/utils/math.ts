// gets a random integer with the specified number of digits
export const getRandomNumber = (digit: number): number => {
  if (digit > 0) {
    const min = 10 ** (digit - 1);
    const max = 10 ** digit;
    return Math.floor(Math.random() * (max - min)) + min;
  } else {
    return 0;
  }
};

export const range = (start: number, end: number): number[] => {
  const output = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += 1) {
    output.push(i);
  }
  return output;
};

export const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};
