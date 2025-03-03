export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Get user profile data
  const getUserProfile = computed(() => {
    return {
      id: user.value?.id,
      email: user.value?.email,
      fullName: user.value?.user_metadata?.full_name,
      description: user.value?.user_metadata?.description,
      avatarUrl: user.value?.user_metadata?.avatar_url,
    }
  })
  
  // Update user profile
  const updateUserProfile = async (profileData: {
    fullName?: string
    description?: string
    avatarUrl?: string
  }) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.fullName,
        description: profileData.description,
        avatar_url: profileData.avatarUrl,
      },
    })
    
    if (error) throw error
    
    return { success: true }
  }
  
  const uploadAvatar = async (file: File) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.value.id}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })
      
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await updateUserProfile({ avatarUrl: publicUrl })
      
    return { publicUrl }
  }
  
  const deleteAvatar = async () => {
    if (!user.value) throw new Error('User not authenticated')
    
    // Check if user has an avatar
    const currentAvatarUrl = getUserProfile.value.avatarUrl
    
    if (!currentAvatarUrl) {
      // No avatar to delete
      return { success: true }
    }
    
    // Get all files that start with the user's ID
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', {
        search: user.value.id
      })
      
    if (listError) throw listError
    
    // If files found, delete them
    if (files && files.length > 0) {
      const filesToDelete = files.map(file => file.name)
      
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete)
        
      if (deleteError) throw deleteError
    }
    
    // Update user profile to remove avatar URL
    await updateUserProfile({ avatarUrl: undefined })
    
    return { success: true }
  }
  
  return {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    deleteAvatar,
  }
} 