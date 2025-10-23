import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testStorage() {
  try {
    console.log('Testing Supabase storage...')
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name))
    
    const accommodationsBucket = buckets?.find(b => b.name === 'accommodations')
    
    if (!accommodationsBucket) {
      console.log('Creating accommodations bucket...')
      
      const { error: bucketError } = await supabase.storage.createBucket('accommodations', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError)
        return
      }
      
      console.log('✅ Accommodations bucket created successfully')
    } else {
      console.log('✅ Accommodations bucket already exists')
    }
    
    // Test upload a small file
    console.log('Testing file upload...')
    const testContent = 'test'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('accommodations')
      .upload('test-upload.txt', testFile)
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError)
    } else {
      console.log('✅ Upload test successful:', uploadData)
      
      // Clean up test file
      await supabase.storage.from('accommodations').remove(['test-upload.txt'])
      console.log('✅ Test file cleaned up')
    }
    
  } catch (error) {
    console.error('Error testing storage:', error)
  }
}

testStorage()
