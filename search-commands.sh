# Search for anonymous queries (likely missing operation names)
grep -r "query {" --include="*.ts" --include="*.tsx" --include="*.js" .
grep -r "mutation {" --include="*.ts" --include="*.tsx" --include="*.js" .

# Search for executeGraphQL calls that might be missing the operation name parameter
grep -r "executeGraphQL(" --include="*.ts" --include="*.tsx" --include="*.js" .

# Search for direct GraphQL client usage
grep -r "client.request(" --include="*.ts" --include="*.tsx" --include="*.js" .