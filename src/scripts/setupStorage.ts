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

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage...')
    
    // Create accommodations bucket if it doesn't exist
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('accommodations', {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError)
      return
    }

    console.log('✅ Storage bucket "accommodations" is ready')

    // Set up RLS policies for the bucket
    const policies = [
      {
        name: 'Allow public read access',
        definition: 'bucket_id = \'accommodations\'',
        check: 'bucket_id = \'accommodations\'',
        command: 'SELECT'
      },
      {
        name: 'Allow authenticated users to upload',
        definition: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        check: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        command: 'INSERT'
      },
      {
        name: 'Allow authenticated users to update',
        definition: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        check: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        command: 'UPDATE'
      },
      {
        name: 'Allow authenticated users to delete',
        definition: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        check: 'bucket_id = \'accommodations\' AND auth.role() = \'authenticated\'',
        command: 'DELETE'
      }
    ]

    console.log('Setting up storage policies...')
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('create_policy', {
          policy_name: policy.name,
          table_name: 'objects',
          definition: policy.definition,
          check_expression: policy.check,
          command: policy.command
        })
        
        if (error && !error.message.includes('already exists')) {
          console.warn(`Policy ${policy.name} setup warning:`, error.message)
        }
      } catch (err) {
        console.warn(`Policy ${policy.name} setup warning:`, err)
      }
    }

    console.log('✅ Storage policies configured')
    console.log('Storage setup completed successfully!')
    
  } catch (error) {
    console.error('Error setting up storage:', error)
    process.exit(1)
  }
}

setupStorage()
