export const buildQueryParamsUrl = (
  url: string,
  queryParamsObj?: Record<string, string | number | boolean | null | unknown[]>
) => {
  if (!queryParamsObj) {
    return url;
  }

  const validParams = Object.fromEntries(
    Object.entries(queryParamsObj)
      .filter(([_, value]) => Boolean(value))
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length === 1) {
            return [key, `,${value[0]}`];
          }
          return [key, value.join(',')];
        }
        return [key, String(value)];
      })
  );

  const searchParams = new URLSearchParams(validParams).toString();
  return searchParams ? `${url}?${searchParams}` : url;
};

export function urlBuilder(url: string, pathParams?: Record<string, unknown>) {
  if (!pathParams) {
    return url;
  }

  Object.entries(pathParams).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
  });

  return url;
}
