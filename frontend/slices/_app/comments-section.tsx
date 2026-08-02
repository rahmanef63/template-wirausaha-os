"use client";

/**
 * CommentsSection — agency host skin for the reusable `comments` slice.
 *
 * The slice ships renderless <CommentsThread> (render-prop) + a props-driven
 * Convex adapter (useComments bindings). This component wires those bindings
 * to the agency's convex `features/comments` functions and renders a simple
 * threaded skin (reply boxes nested by parentId). Mounted on public article +
 * portfolio detail pages.
 */

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CommentsThread,
  type CommentsBindings,
} from "@/features/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "./comment-item";

function useCommentBindings(): CommentsBindings {
  const create = useMutation(api.features.comments.mutation.create);
  const update = useMutation(api.features.comments.mutation.update);
  const resolve = useMutation(api.features.comments.mutation.resolve);
  const remove = useMutation(api.features.comments.mutation.remove);

  return {
    list: (target) =>
      useQuery(api.features.comments.public.listForTarget, { target }),
    create: async ({ target, text, parentId }) => {
      await create({
        target,
        body: text,
        tenantId: null,
        parentId: parentId as never,
      });
    },
    update: async ({ id, text }) => {
      await update({ id, body: text });
    },
    resolve: async ({ id, resolved }) => {
      await resolve({ id, resolved });
    },
    remove: async ({ id }) => {
      await remove({ id });
    },
  };
}

export function CommentsSection({
  kind,
  slug,
  title = "Discussion",
}: {
  kind: string;
  slug: string;
  title?: string;
}) {
  const bindings = useCommentBindings();
  const { isAuthenticated } = useConvexAuth();
  const target = React.useMemo(() => ({ kind, id: slug }), [kind, slug]);
  const [draft, setDraft] = React.useState("");

  return (
    <section id="comments" className="mt-16 border-t border-border pt-10">
      <CommentsThread target={target} bindings={bindings}>
        {({ tree, openCount, isLoading, create }) => (
          <>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {title}
              {openCount > 0 && (
                <span className="ml-2 font-normal normal-case text-muted-foreground/70">
                  {openCount} open
                </span>
              )}
            </h2>

            {isAuthenticated ? (
              <div className="mt-4 space-y-2">
                <Textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Share your thoughts…"
                />
                <Button
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => {
                    void create({ target, text: draft.trim() });
                    setDraft("");
                  }}
                >
                  Post comment
                </Button>
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                Sign in to join the discussion.
              </p>
            )}

            {isLoading ? (
              <p className="mt-6 text-sm text-muted-foreground">Loading comments…</p>
            ) : tree.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <ul className="mt-6 space-y-6">
                {tree.map((node) => (
                  <CommentItem
                    key={node.id}
                    node={node}
                    canPost={isAuthenticated}
                    onReply={(parentId, text) => void create({ target, text, parentId })}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </CommentsThread>
    </section>
  );
}
