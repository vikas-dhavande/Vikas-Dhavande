"use client";

import type * as React from "react";
import { Blobatar as Generated } from "@blobatar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type GeneratedOptions = DistributiveOmit<React.ComponentProps<typeof Generated>, "name">;

export type BlobatarProps = React.ComponentProps<typeof Avatar> & {
  /**
   * Who the avatar is for. A username, a display name, an email, an id — any
   * string, and the same string always renders the same blobatar.
   */
  name: string;
  /** A real profile image, when there is one. The blobatar is the fallback. */
  src?: string;
  /** Defaults to `name`. Ignored when there is no `src`. */
  alt?: string;
  /**
   * Anything else the blobatar takes: `palette`, `animate`, `expression`, …
   */
  blobatar?: GeneratedOptions;
};

export function Blobatar({ name, src, alt, blobatar, ...props }: BlobatarProps) {
  return (
    <Avatar {...props}>
      {src ? <AvatarImage src={src} alt={alt ?? name} /> : null}
      <AvatarFallback className="bg-transparent">
        <Generated {...blobatar} name={name} className="size-full" />
      </AvatarFallback>
    </Avatar>
  );
}
