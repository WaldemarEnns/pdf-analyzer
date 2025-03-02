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
  
  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `avatars/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })
      
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
      
    return { publicUrl }
  }
  
  return {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
  }
} 