/**
 * Code Snippet Service
 * Manages saving, loading, and publishing code snippets
 */

import { supabase } from '@/lib/supabase';

export interface CodeSnippet {
  id: string;
  userId: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  isPublic: boolean;
  likes: number;
  views: number;
  forks: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SnippetVersion {
  id: string;
  snippetId: string;
  code: string;
  version: number;
  createdAt: Date;
}

/**
 * Save code snippet to database
 */
export async function saveSnippet(
  snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views' | 'forks'>
): Promise<{ success: boolean; snippetId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('code_snippets')
      .insert({
        user_id: snippet.userId,
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        is_public: snippet.isPublic,
        tags: snippet.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    return {
      success: true,
      snippetId: data.id,
    };
  } catch (error) {
    console.error('Save snippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save snippet',
    };
  }
}

/**
 * Update existing snippet
 */
export async function updateSnippet(
  snippetId: string,
  updates: Partial<Omit<CodeSnippet, 'id' | 'userId' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('code_snippets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', snippetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update snippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update snippet',
    };
  }
}

/**
 * Load user's snippets
 */
export async function loadUserSnippets(
  userId: string
): Promise<{ success: boolean; snippets?: CodeSnippet[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const snippets = data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      description: item.description,
      code: item.code,
      language: item.language,
      isPublic: item.is_public,
      likes: item.likes || 0,
      views: item.views || 0,
      forks: item.forks || 0,
      tags: item.tags || [],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    return {
      success: true,
      snippets,
    };
  } catch (error) {
    console.error('Load snippets error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load snippets',
    };
  }
}

/**
 * Publish snippet (make public)
 */
export async function publishSnippet(
  snippetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('code_snippets')
      .update({ is_public: true })
      .eq('id', snippetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Publish snippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish snippet',
    };
  }
}

/**
 * Delete snippet
 */
export async function deleteSnippet(
  snippetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('code_snippets').delete().eq('id', snippetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete snippet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete snippet',
    };
  }
}

/**
 * Create snippet version (for version history)
 */
export async function createSnippetVersion(
  snippetId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current version count
    const { data: versions } = await supabase
      .from('snippet_versions')
      .select('version')
      .eq('snippet_id', snippetId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

    const { error } = await supabase.from('snippet_versions').insert({
      snippet_id: snippetId,
      code,
      version: nextVersion,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Create version error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create version',
    };
  }
}

/**
 * Get snippet versions
 */
export async function getSnippetVersions(
  snippetId: string
): Promise<{ success: boolean; versions?: SnippetVersion[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('snippet_versions')
      .select('*')
      .eq('snippet_id', snippetId)
      .order('version', { ascending: false });

    if (error) throw error;

    const versions = data.map((item: any) => ({
      id: item.id,
      snippetId: item.snippet_id,
      code: item.code,
      version: item.version,
      createdAt: new Date(item.created_at),
    }));

    return {
      success: true,
      versions,
    };
  } catch (error) {
    console.error('Get versions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get versions',
    };
  }
}
