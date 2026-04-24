import Link from "next/link";
import { notFound } from "next/navigation";
import { AppSidebar } from "../../../src/components/ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../src/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../src/components/ui/sidebar";
import { createClient } from "../../../src/lib/supabase-server";
import { Blog as BlogType } from "../../../src/types";
import { Calendar, User, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { calculateReadingTime } from "../../../src/lib/utils";

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const blog = data as BlogType;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/blog" />}>Blog</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[150px] truncate">{blog.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </header>

        <article className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-4 md:p-8">
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              {blog.metadata && typeof blog.metadata === "object" && blog.metadata.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wider text-xs">
                  {String(blog.metadata.category)}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{blog.author_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blog.published_at ?? blog.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {calculateReadingTime(blog.content)} min read
              </div>
            </div>
          </div>

          <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted mb-10">
            {blog.thumbnail_url ? (
              <img
                src={blog.thumbnail_url}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                <BookOpen className="h-20 w-20 text-primary/10" />
              </div>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {blog.content.split("\n").map((para, i) =>
              para ? (
                <p key={i} className="mb-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  {para}
                </p>
              ) : (
                <br key={i} />
              )
            )}
          </div>

          <div className="mt-16 border-t pt-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="text-xl font-bold">Enjoyed this article?</h3>
              <p className="text-muted-foreground max-w-md">
                Subscribe to our newsletter to receive the latest updates directly in your inbox.
              </p>
              <div className="flex w-full max-w-sm items-center gap-2">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </article>
      </SidebarInset>
    </SidebarProvider>
  );
}
