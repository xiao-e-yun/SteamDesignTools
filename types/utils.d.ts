export type FilterKeysToObject<FilterObject, Filter> = {
    [K in keyof FilterObject as FilterObject[K] extends Filter ? K : never]: FilterObject[K]
}