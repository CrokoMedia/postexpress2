/**
 * Instagram Profile Scraper - Post Express Custom Actor
 *
 * Este Actor extrai dados completos de perfis do Instagram, incluindo:
 * - Nome completo (ownerFullName)
 * - Username (ownerUsername)
 * - ID do usuário (ownerId)
 * - 🆕 FOTO DE PERFIL (ownerProfilePicUrl)
 * - Posts com métricas
 * - Comentários
 */

import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

// Obter input do usuário
const input = await Actor.getInput();
const {
    username,
    maxPosts = 50,
    includeComments = true,
    commentsLimit = 10
} = input;

console.log(`🚀 Iniciando scraping do perfil: @${username}`);

const crawler = new CheerioCrawler({
    async requestHandler({ request, $ }) {
        const url = request.url;

        // Extrair dados do Instagram
        // O Instagram armazena dados em JSON dentro de <script> tags
        const scripts = $('script[type="application/ld+json"]').toArray();

        let profileData = null;
        let ownerProfilePicUrl = null;
        let ownerFullName = null;
        let ownerId = null;
        let ownerUsername = username;

        // Buscar dados estruturados
        for (const script of scripts) {
            try {
                const data = JSON.parse($(script).html());

                // Instagram profile schema
                if (data['@type'] === 'Person') {
                    ownerFullName = data.name;
                    ownerProfilePicUrl = data.image; // 🎯 FOTO DE PERFIL!
                }
            } catch (e) {
                // Ignorar erros de parsing
            }
        }

        // Buscar dados no shared_data (método alternativo)
        const sharedDataScripts = $('script').toArray()
            .map(s => $(s).html())
            .find(html => html && html.includes('window._sharedData'));

        if (sharedDataScripts) {
            try {
                const match = sharedDataScripts.match(/window\._sharedData\s*=\s*({.+?});/);
                if (match) {
                    const sharedData = JSON.parse(match[1]);
                    const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;

                    if (user) {
                        ownerId = user.id;
                        ownerFullName = user.full_name;
                        ownerUsername = user.username;
                        ownerProfilePicUrl = user.profile_pic_url_hd || user.profile_pic_url; // 🎯 FOTO DE PERFIL HD!

                        // Extrair posts
                        const edges = user.edge_owner_to_timeline_media?.edges || [];

                        for (const edge of edges.slice(0, maxPosts)) {
                            const node = edge.node;

                            const post = {
                                id: node.id,
                                type: node.__typename === 'GraphSidecar' ? 'Sidecar' :
                                      node.__typename === 'GraphVideo' ? 'Video' : 'Image',
                                shortCode: node.shortcode,
                                caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                                url: `https://www.instagram.com/p/${node.shortcode}/`,
                                likesCount: node.edge_liked_by?.count || 0,
                                commentsCount: node.edge_media_to_comment?.count || 0,
                                timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
                                displayUrl: node.display_url,

                                // 🎯 DADOS DO DONO (COM FOTO DE PERFIL)
                                ownerFullName,
                                ownerUsername,
                                ownerId,
                                ownerProfilePicUrl, // ✅ FOTO DE PERFIL DO DONO!
                            };

                            // Adicionar comentários se solicitado
                            if (includeComments && node.edge_media_to_comment) {
                                post.latestComments = [];

                                const comments = node.edge_media_to_comment.edges || [];
                                for (const commentEdge of comments.slice(0, commentsLimit)) {
                                    const comment = commentEdge.node;
                                    const commentOwner = comment.owner;

                                    post.latestComments.push({
                                        id: comment.id,
                                        text: comment.text,
                                        ownerUsername: commentOwner.username,
                                        ownerProfilePicUrl: commentOwner.profile_pic_url, // Foto do comentarista
                                        timestamp: new Date(comment.created_at * 1000).toISOString(),
                                        likesCount: comment.edge_liked_by?.count || 0,
                                        owner: {
                                            id: commentOwner.id,
                                            username: commentOwner.username,
                                            is_verified: commentOwner.is_verified || false,
                                            profile_pic_url: commentOwner.profile_pic_url,
                                        }
                                    });
                                }
                            }

                            // Salvar no dataset
                            await Actor.pushData(post);
                        }

                        console.log(`✅ Extraídos ${edges.length} posts de @${ownerUsername}`);
                        console.log(`📸 Foto de perfil: ${ownerProfilePicUrl ? '✅ Encontrada!' : '❌ Não encontrada'}`);
                    }
                }
            } catch (e) {
                console.error('Erro ao extrair shared_data:', e);
            }
        }

        // Se não conseguiu pelos métodos acima, tentar via meta tags
        if (!ownerProfilePicUrl) {
            // Buscar Open Graph image
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) {
                ownerProfilePicUrl = ogImage;
                console.log(`📸 Foto de perfil obtida via Open Graph: ${ogImage}`);
            }
        }
    },

    maxRequestsPerCrawl: 10,
    maxConcurrency: 1,
});

// Adicionar URL do perfil
await crawler.run([
    `https://www.instagram.com/${username}/`
]);

console.log('🎉 Scraping concluído!');

await Actor.exit();
