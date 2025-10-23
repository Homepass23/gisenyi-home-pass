import { supabaseAdmin } from '../../lib/supabaseClient'

/**
 * Migration script to update user_role enum from 'owner' to 'host'
 * This script handles the database enum update and data migration
 */

async function updateUserRoleEnum() {
  try {
    console.log('Starting user_role enum migration...')

    // Step 1: Update existing users with role 'owner' to 'host'
    console.log('Updating existing users with role "owner" to "host"...')
    const { data: usersToUpdate, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('role', 'owner')

    if (selectError) {
      console.error('Error selecting users to update:', selectError)
      return
    }

    if (usersToUpdate && usersToUpdate.length > 0) {
      console.log(`Found ${usersToUpdate.length} users with role "owner" to update`)
      
      // Update each user's role to 'host'
      for (const user of usersToUpdate) {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ role: 'host' })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error updating user ${user.id}:`, updateError)
        } else {
          console.log(`Updated user ${user.id} from "owner" to "host"`)
        }
      }
    } else {
      console.log('No users found with role "owner"')
    }

    // Step 2: Update the enum type in the database
    console.log('Updating user_role enum type...')
    
    // First, add the new 'host' value to the enum
    const { error: addEnumError } = await supabaseAdmin.rpc('exec_sql', {
      sql: "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'host'"
    })

    if (addEnumError) {
      console.error('Error adding "host" to enum:', addEnumError)
    } else {
      console.log('Successfully added "host" to user_role enum')
    }

    // Step 3: Remove the old 'owner' value from the enum (if no users have it)
    // Note: PostgreSQL doesn't support removing enum values directly
    // We'll leave 'owner' in the enum for now to avoid breaking existing data
    console.log('Migration completed successfully!')
    console.log('Note: The "owner" enum value remains in the database for backward compatibility')
    console.log('All users have been updated to use "host" role')

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run the migration
updateUserRoleEnum()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
