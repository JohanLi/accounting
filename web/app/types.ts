/*
 derived from https://nextjs.org/docs/app/api-reference/file-conventions/page
 TODO need to include "| string[] | undefined" as well
 */
export type NextPageProps = {
  params: { slug: string }
  searchParams: { [key: string]: string }
}
