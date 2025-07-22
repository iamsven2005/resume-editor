import { BlogPosts } from "@/components/posts";

export default function Page() {
  return (
    <section className="m-5 p-5">
      <h1 className="mb-8 text-3xl font-semibold tracking-tighter">
        Patches and updates
      </h1>
      <p className="mb-4">
        {`Patch Notes and Updates`}
      </p>
      <div className="my-8">
        <BlogPosts/>
      </div>
    </section>
  )
}
