import React from 'react';
import ReactDOM from 'react-dom';

let hookStates = [] // 保存所有状态的数组
let hookIndex = 0 // 索引
function useState(initState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initState
  const currentIndex = hookIndex
  function setState(newState) {
    if (typeof newState === 'function') {
      newState = newState(hookStates[currentIndex])
    }
    hookStates[currentIndex] = newState
    render()
  }
  return [hookStates[hookIndex++], setState]
}

// function useEffect(callback, dependencies) {
//   if (hookStates[hookIndex]) { // 非第一次
//     let lastDependencies = hookStates[hookIndex]
//     let isSame = dependencies.every((item, index) => item === lastDependencies[index])
//     if (isSame) {
//       hookIndex++
//     } else {
//       hookStates[hookIndex++] = dependencies
//       setTimeout(callback); // 添加一个宏任务，在本次渲染之后执行
//     }
//   } else { // 第一次渲染
//     hookStates[hookIndex++] = dependencies
//     setTimeout(callback); // 添加一个宏任务，在本次渲染之后执行
//   }
// }

function useEffect(callback, dependencies) {
  if (hookStates[hookIndex]) { // 非第一次
    let [oldDestroy, lastDependencies] = hookStates[hookIndex]
    let isSame = dependencies.every((item, index) => item === lastDependencies[index])
    if (isSame) {
      hookIndex++
    } else {
      oldDestroy()
      const destroy = callback()
      hookStates[hookIndex++] = [destroy, dependencies]
    }
  } else { // 第一次渲染
    const destroy = callback()
    hookStates[hookIndex++] = [destroy, dependencies]
  }
}

function useLayoutEffect(callback, dependencies) {
  if (hookStates[hookIndex]) { // 非第一次
    let lastDependencies = hookStates[hookIndex]
    let isSame = dependencies.every((item, index) => item === lastDependencies[index])
    if (isSame) {
      hookIndex++
    } else {
      hookStates[hookIndex++] = dependencies
      queueMicrotask(callback) // 添加一个微任务，在本次渲染前执行
    }
  } else { // 第一次渲染
    hookStates[hookIndex++] = dependencies
    queueMicrotask(callback) // 添加一个微任务，在本次渲染前执行
  }
}

function useMemo(factory, dependencies) {
  if (hookStates[hookIndex]) { // 非第一次
    const [lastMemo, lastDependencies] = hookStates[hookIndex]
    const isSame = dependencies.every((item, index) => item === lastDependencies[index])
    if (isSame) {
      hookIndex++
      return lastMemo
    } else {
      const newMemo = factory()
      hookStates[hookIndex++] = [newMemo, dependencies]
      return newMemo
    }
  } else { // 第一次渲染
    const newMemo = factory()
    hookStates[hookIndex++] = [newMemo, dependencies]
    return newMemo
  }
}

function useCallback(callback, dependencies) {
  if (hookStates[hookIndex]) { // 非第一次
    const [lastCallback, lastDependencies] = hookStates[hookIndex]
    const isSame = dependencies.every((item, index) => item === lastDependencies[index])
    if (isSame) {
      hookIndex++
      return lastCallback
    } else {
      hookStates[hookIndex++] = [callback, dependencies]
      return callback
    }
  } else { // 第一次渲染
    hookStates[hookIndex++] = [callback, dependencies]
    return callback
  }
}

function useContext(context) {
  return context._currentValue
}

function useRef(value) {
  hookStates[hookIndex] = hookStates[hookIndex] || { current: value }
  return hookStates[hookIndex++]
}

function useReducer(reducer, initState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initState
  const currentIndex = hookIndex
  function dispatch(action) {
    hookStates[currentIndex] = reducer ? reducer(hookStates[currentIndex], action) : action
    render()
  }
  return [hookStates[hookIndex++], dispatch]
}

// useState是useReducer的语法糖
// function useState(initState) {
//   return useReducer(null, initState)
// }

function Counter() {
  const [number1, setNumber1] = useState(0)
  const [number2, setNumber2] = useState(0)
  return <div>
    <p>{number1}</p>
    <button onClick={() => setNumber1(number1 + 1)}>+</button>
    <hr />
    <p>{number2}</p>
    <button onClick={() => setNumber2(number2 + 1)}>+</button>
  </div>
}

function render() {
  hookIndex = 0
  ReactDOM.render(
    <Counter />,
    document.getElementById('root')
  );
}
render()
