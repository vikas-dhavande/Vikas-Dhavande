import Link from "next/link";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getBlogs } from "@/lib/blogs";
import { Blog as BlogType } from "@/types";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { calculateReadingTime } from "@/lib/utils";

export default async function BlogPage() {
  const blogs: BlogType[] = await getBlogs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Latest Articles</h1>
            <p className="text-muted-foreground">
              Explore the latest insights on development, design, and technology.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {blog.thumbnail_url ? (
                      <img
                        src={blog.thumbnail_url}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/20">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                      {blog.metadata && typeof blog.metadata === "object" && (blog.metadata as any).category && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                          {String((blog.metadata as any).category)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(blog.published_at!).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                      {blog.content.substring(0, 150)}...
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium">{blog.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {calculateReadingTime(blog.content)} min read
                        <ArrowRight className="h-3 w-3 ml-1 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No articles found. Check back later!
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
