import { useState } from 'react'
import axios from 'axios'
import { v4 } from 'uuid'
import { toast } from "./use-toast"
import { useGetUrlForUploadMutation } from '@/redux/api/app'

interface FileUploadReturn {
    uploading: boolean
    uploadFile: (file: File) => Promise<string | undefined>
}

export function useFileUpload(): FileUploadReturn {
    const [uploading, setUploading] = useState(false)
    const [getUrlForUploadApi] = useGetUrlForUploadMutation()

    const uploadFile = async (file: File): Promise<string | undefined> => {
        setUploading(true)
        try {
            const ext = file.name.split('.').pop()
            const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.')
            const filename = `${v4()}-${fileNameWithoutExt.replace(/\s+/g, '-')}.${ext}`

            // Get signed URL for upload using the mutation
            const { data: uploadUri } = await getUrlForUploadApi(filename).unwrap()

            if (!uploadUri) {
                throw new Error('Failed to get upload URL')
            }

            // Upload file to signed URL
            await axios.put(uploadUri, file, {
                headers: {
                    'Content-Type': file.type
                }
            })

            toast({
                variant: "success",
                title: "File Upload Successful",
                description: `The file ${file.name} has been uploaded successfully.`,
            })

            return filename
        } catch (error) {
            toast({
                variant: "destructive",
                title: "File Upload Failed",
                description: `The file ${file.name} could not be uploaded. Please try again.`,
            })

            console.error('File upload error:', error)
            return undefined
        } finally {
            setUploading(false)
        }
    }

    return {
        uploading,
        uploadFile
    }
}
