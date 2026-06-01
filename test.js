console.log('salam!')

const arr = [
  {
    qty: 2,
    pr_mod: 3,
  },
]

console.log('org: ', arr)
const updatedArr = [...arr]
console.log('before: ', updatedArr)
updatedArr[0].qty = Number(3)
console.log('after: ', updatedArr)
