'use client';

import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { Play, Youtube, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

const videos: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Welcome to WebX',
    description: 'A quick introduction to our platform and features.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
  },
  {
    id: '9bZkp7q19f0',
    title: 'Next.js 16 Deep Dive',
    description: 'Exploring the new features of Next.js 16 and React 19.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'L72fhGm15RE',
    title: 'Tailwind CSS 4.0 Guide',
    description: 'Mastering the latest styling techniques with Tailwind 4.',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2031&auto=format&fit=crop',
  },
  {
    id: 'y881t8ilMyc',
    title: 'Supabase Integration',
    description: 'How to securely connect your app to Supabase services.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function VideoList() {
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);

  return (
    <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-center gap-12"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Videos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated list of tutorials, guides, and project showcases.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full"
        >
          {videos.map((video) => (
            <Dialog key={video.id}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-3 text-primary shadow-lg backdrop-blur-sm">
                        <Play className="size-6 fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                      <Youtube className="mr-1 inline-block size-3" />
                      YouTube
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4 space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>{video.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <a
            href="https://youtube.com/@vikas-dhavande"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            View all on YouTube
            <ExternalLink className="size-4" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
