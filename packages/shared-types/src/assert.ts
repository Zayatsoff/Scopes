// compile-time only: T fails to typecheck here if it drifts from being assignable to U
export type AssertExtends<T extends U, U> = T
