"use client";

/**
 * CommentItem — single threaded comment row + nested reply box, used by
 * CommentsSection. Renderless of any Convex wiring (pure props): receives a
 * CommentNode and an onReply callback. Recurses for nested replies.
 */

import * as React from "react";
import { type CommentNode } from "@/features/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function CommentItem({
  node,
  canPost,
  onReply,
}: {
  node: CommentNode;
  canPost: boolean;
  onReply: (parentId: string, text: string) => void;
}) {
  const [replying, setReplying] = React.useState(false);
  const [text, setText] = React.useState("");
  return (
    <li className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>{node.authorName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{node.authorName}</span>
            <span>· {timeAgo(node.createdAt)}</span>
            {node.resolved && <span className="text-emerald-600">· resolved</span>}
          </div>
          <p className="text-sm text-foreground/90">{node.text}</p>
          {canPost && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {replying ? "Cancel" : "Reply"}
            </button>
          )}
          {replying && (
            <div className="space-y-2 pt-1">
              <Textarea
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a reply…"
              />
              <Button
                size="sm"
                disabled={!text.trim()}
                onClick={() => {
                  onReply(node.id, text.trim());
                  setText("");
                  setReplying(false);
                }}
              >
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>
      {node.replies.length > 0 && (
        <ul className="ml-6 space-y-4 border-l border-border/60 pl-4">
          {node.replies.map((child) => (
            <CommentItem key={child.id} node={child} canPost={canPost} onReply={onReply} />
          ))}
        </ul>
      )}
    </li>
  );
}
