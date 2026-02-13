import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function assignManager() {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        console.log('Usage: npx tsx scripts/assign-manager.ts <employee_email> <manager_email>')
        process.exit(1)
    }

    const [employeeEmail, managerEmail] = args

    console.log(`🔍 Finding users...`)
    console.log(`   Employee: ${employeeEmail}`)
    console.log(`   Manager:  ${managerEmail}`)

    // 1. Get Employee
    const { data: employees, error: empError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', employeeEmail)
        .single()

    if (empError || !employees) {
        console.error(`❌ Employee not found: ${employeeEmail}`)
        // Fallback: Check auth.users if profiles doesn't have email column (though it usually does in our schema)
        // Our profiles table has 'email'.
        process.exit(1)
    }

    // 2. Get Manager
    const { data: manager, error: mgrError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', managerEmail)
        .single()

    if (mgrError || !manager) {
        console.error(`❌ Manager not found: ${managerEmail}`)
        process.exit(1)
    }

    // 3. Update
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ manager_id: manager.id })
        .eq('id', employees.id)

    if (updateError) {
        console.error(`❌ Failed to assign manager:`, updateError.message)
        process.exit(1)
    }

    console.log(`✅ Success! assigned ${manager.full_name} (${managerEmail}) as manager for ${employees.full_name} (${employeeEmail})`)
}

assignManager()
