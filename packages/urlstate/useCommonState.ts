import React from 'react';

import { stateMap, subscribers } from './subscribers';
import {
  type DeepReadonly,
  isEqual,
  isSSR,
  type JSONCompatible,
} from './utils';

// TODO: export as helper
export function useCommonState<T extends JSONCompatible>(
  defaultState: T,
  _getInitial?: () => T,
) {
  const stateShape = React.useRef(defaultState);

  const [state, _setState] = React.useState(() => {
    if (isSSR()) {
      return _getInitial?.() || stateShape.current;
    }

    const val = stateMap.get(stateShape.current);
    if (!val) {
      const newVal = _getInitial?.() || stateShape.current;
      stateMap.set(stateShape.current, newVal);
      return newVal;
    }
    return val;
  });

  const setState = React.useCallback(
    (
      value:
        | (T | DeepReadonly<T>)
        | ((currState: typeof stateShape.current) => typeof stateShape.current),
    ): void => {
      const curr = stateMap.get(stateShape.current) || stateShape.current;
      const isFunc = typeof value === 'function';

      if (isFunc) {
        const newVal = value(curr);
        if (isEqual(curr, newVal)) return void 0;
        stateMap.set(stateShape.current, newVal);
        subscribers.get(stateShape.current).forEach((sub) => {
          sub();
        });
      } else {
        if (isEqual(curr, value)) return void 0;
        stateMap.set(stateShape.current, value as T);
        subscribers.get(stateShape.current).forEach((sub) => {
          sub();
        });
      }
    },
    [],
  );

  React.useInsertionEffect(() => {
    const cb = () => {
      _setState(stateMap.get(stateShape.current) || stateShape.current);
    };
    const unsub = subscribers.add(stateShape.current, cb);

    return () => {
      unsub();
    };
  }, []);

  // get state without deps
  const getState = React.useCallback(() => {
    return stateMap.get(stateShape.current) || stateShape.current;
  }, []);

  return { state, getState, setState };
}
