import { streamText } from 'ai'
import { modelVision } from '~/services/ai'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || !formData[0]) {
      throw new Error('No file uploaded')
    }

    const file = formData[0]
    if (!file.filename?.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF file.')
    }

    const timestamp = Date.now();
    const sanitizedFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFilename}`;

    // Get the authenticated user
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get authenticated client
    const supabase = await serverSupabaseClient(event)

    // Construct the file path with the user ID as the folder
    const userId = user.id;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading file to:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file.data, {
        contentType: 'application/pdf'
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath)

    // Analyze the PDF using the model
    const stream = streamText({
      model: modelVision,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze the PDF and provide a broad summary of its contents. Focus on the main points, key findings, and any important conclusions. Categorize the content into sections and provide a summary of each section. Return the summary directly. Use markdown formatting.'
            },
            {
              type: 'file',
              mimeType: 'application/pdf',
              data: file.data,
            },
          ],
        }
      ]
    })
    
    // Return the stream directly to the client
    return sendStream(event, stream.textStream)
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'An error occurred while processing the PDF'
    })
  }
}) 