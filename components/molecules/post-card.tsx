import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { formatNumber } from '@/lib/format'
import { Heart, MessageCircle, Eye } from 'lucide-react'
import Image from 'next/image'
import type { Post } from '@/types/database'

interface PostCardProps {
  post: Post
  onClick?: () => void
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg hover:border-primary-500/50 transition-all cursor-pointer group" onClick={onClick}>
      {/* Image */}
      {post.display_url && (
        <div className="relative aspect-square bg-neutral-700">
          <Image
            src={post.display_url}
            alt="Post"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="neutral">
            {post.post_type || 'Image'}
          </Badge>
          {post.is_pinned && (
            <Badge variant="info">Fixado</Badge>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-neutral-300 line-clamp-3">
            {post.caption}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{formatNumber(post.likes_count || 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{formatNumber(post.comments_count || 0)}</span>
          </div>
          {post.video_view_count && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.video_view_count)}</span>
            </div>
          )}
        </div>

        {/* Date */}
        {post.post_timestamp && (
          <div className="text-xs text-neutral-500">
            {new Date(post.post_timestamp).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    </Card>
  )
}
