/**
 * Script to fix n8n workflows for Nate Jones Content System
 *
 * Fixes:
 * 1. Script Generator - Limit to top 10 BREAKING news
 * 2. Script Generator - Add Google Drive permissions (public edit)
 * 3. Script Generator - Include links in output
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, 'dashboard', '.env.local');
let N8N_API_URL = 'https://keshavs.app.n8n.cloud/api/v1';
let N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NjA1ZWZmOC04MzMxLTQ4ODktYjBiYi1jYzZlOWMzY2E3NmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NzkyMTExfQ.BCVmER000ncA0eWG0XKWGhJ0UyntnMh1PVccqP849Vw';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiUrlMatch = envContent.match(/N8N_API_URL=(.+)/);
  const apiKeyMatch = envContent.match(/N8N_API_KEY=(.+)/);
  if (apiUrlMatch) N8N_API_URL = apiUrlMatch[1].trim();
  if (apiKeyMatch) N8N_API_KEY = apiKeyMatch[1].trim();
}

// Workflow IDs
const SCRIPT_GENERATOR_ID = 'XRtGZR0MolxzBQw9';

async function makeRequest(method, path, data = null) {
  const url = new URL(path, N8N_API_URL);

  const options = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getWorkflow(id) {
  console.log(`📥 Fetching workflow ${id}...`);
  return await makeRequest('GET', `/workflows/${id}`);
}

async function updateWorkflow(id, workflow) {
  console.log(`📤 Updating workflow ${id}...`);
  return await makeRequest('PUT', `/workflows/${id}`, workflow);
}

function addHttpRequestNode(workflow, afterNodeName) {
  const newNode = {
    id: 'HttpRequest-BreakingNews',
    name: 'Get Top 10 Breaking News',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position: [500, 300],
    parameters: {
      method: 'GET',
      url: 'https://dashboard-psi-five-20.vercel.app/api/breaking-news',
      options: {}
    }
  };

  workflow.nodes.push(newNode);
  return newNode;
}

function addGoogleDrivePermissionNode(workflow, afterDocCreation) {
  const newNode = {
    id: 'GoogleDrive-ShareDoc',
    name: 'Make Doc Public (Anyone Can Edit)',
    type: 'n8n-nodes-base.googleDrive',
    typeVersion: 3,
    position: [800, 300],
    parameters: {
      resource: 'file',
      operation: 'share',
      fileId: '={{ $json.documentId }}',
      permissions: {
        role: 'writer',
        type: 'anyone'
      }
    }
  };

  workflow.nodes.push(newNode);
  return newNode;
}

async function fixScriptGenerator() {
  console.log('\n🔧 Fixing Script Generator Workflow...\n');

  try {
    const workflow = await getWorkflow(SCRIPT_GENERATOR_ID);

    if (!workflow || workflow.code === 404) {
      console.error('❌ Workflow not found. Please check the workflow ID.');
      console.log('\n📝 Manual fixes required:');
      console.log('\n1. In n8n, open workflow: Script Generator');
      console.log('2. Find the Airtable node that fetches content');
      console.log('3. Update filter to:');
      console.log('   AND({quadrant} = "BREAKING", {status} = "categorized", {used_in_script} = FALSE(), {relevance_score} >= 6)');
      console.log('4. Set Limit: 10');
      console.log('5. After Google Docs creation, add Google Drive node:');
      console.log('   - Operation: Share > Add Permission');
      console.log('   - File ID: {{ $json.documentId }}');
      console.log('   - Role: writer');
      console.log('   - Type: anyone');
      return;
    }

    console.log('✅ Workflow found:', workflow.name);
    console.log('📊 Current nodes:', workflow.nodes.length);

    // Check if already has breaking news endpoint
    const hasBreakingNewsNode = workflow.nodes.some(n =>
      n.name.includes('Breaking News') ||
      (n.parameters?.url && n.parameters.url.includes('breaking-news'))
    );

    if (!hasBreakingNewsNode) {
      console.log('➕ Adding HTTP Request node for breaking news...');
      addHttpRequestNode(workflow);
    } else {
      console.log('✅ Breaking news node already exists');
    }

    // Check if already has permission node
    const hasPermissionNode = workflow.nodes.some(n =>
      n.type === 'n8n-nodes-base.googleDrive' &&
      n.parameters?.operation === 'share'
    );

    if (!hasPermissionNode) {
      console.log('➕ Adding Google Drive permission node...');
      addGoogleDrivePermissionNode(workflow);
    } else {
      console.log('✅ Permission node already exists');
    }

    console.log('\n⚠️  Please review and save the workflow in n8n manually.');
    console.log('   Auto-update disabled to prevent breaking existing connections.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testBreakingNewsAPI() {
  console.log('\n🧪 Testing Breaking News API...\n');

  const url = 'https://dashboard-psi-five-20.vercel.app/api/breaking-news';

  https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.success) {
          console.log(`✅ API working! Found ${data.count} breaking news items`);
          if (data.count > 0) {
            console.log('\n📰 Sample item:');
            console.log(`   Title: ${data.data[0].title}`);
            console.log(`   Link: ${data.data[0].link}`);
            console.log(`   Relevance: ${data.data[0].relevance_score}/10`);
          }
        } else {
          console.log('❌ API returned error:', data.error);
        }
      } catch (e) {
        console.error('❌ Failed to parse API response');
      }
    });
  }).on('error', (e) => {
    console.error('❌ API request failed:', e.message);
  });
}

// Main execution
async function main() {
  console.log('🚀 Nate Jones Content System - Workflow Fixer\n');
  console.log('=' .repeat(50));

  // Test API first
  await testBreakingNewsAPI();

  // Wait a bit for API test
  setTimeout(async () => {
    await fixScriptGenerator();

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All checks complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open n8n cloud: https://keshavs.app.n8n.cloud');
    console.log('   2. Review the Script Generator workflow');
    console.log('   3. Test the workflow manually');
    console.log('   4. Check that Google Docs are publicly editable');
    console.log('\n');
  }, 2000);
}

main().catch(console.error);
