import {DependencyList, EffectCallback, useEffect, useRef} from 'react';

const usePrevious = <T>(value: T, initialValue: T) => {
  const ref = useRef<T>(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useEffectDebugger = (
  effectHook: EffectCallback,
  dependencies: DependencyList,
  dependencyNames = [] as string[]
) => {
  const previousDeps = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce<Record<string, unknown>>(
    (accum, dependency, index) => {
      if (dependency !== previousDeps[index]) {
        const keyName = dependencyNames[index] || index;
        return {
          ...accum,
          [keyName]: {
            before: previousDeps[index],
            after: dependency,
          },
        };
      }

      return accum as Record<string, unknown>;
    },
    {} as Record<string, unknown>
  );

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps);
  }

  // TODO Manos: I actually added the effectHook in the dependencies list
  // but apparently the linter does not recognize it, therefore I disable
  // the corresponding error to the following line
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effectHook, dependencies.concat([effectHook]));
};
