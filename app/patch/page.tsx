import { BlogPosts } from "@/components/posts";

export default function Page() {
  return (
    <section className="m-5 p-5">
      <h1 className="mb-8 text-3xl font-semibold tracking-tighter">
        Patches and updates
      </h1>
      <p className="mb-4">
        {`Here is my personal experience in development  that I will continue to update over time.`}
      </p>
      <div className="my-8">
        <BlogPosts/>
      </div>
    </section>
  )
}
