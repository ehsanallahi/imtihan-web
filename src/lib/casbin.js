import { newEnforcer, Model } from 'casbin'
import path from 'path'

// Casbin RBAC model definition
const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && (r.obj == p.obj || p.obj == '*') && (r.act == p.act || p.act == '*')
`

export async function checkPermission(role, resource, action) {
  const model = new Model()
  model.loadModelFromText(modelText)
  
  const policyPath = path.join(process.cwd(), 'src/lib/casbin-policy.csv')
  const enforcer = await newEnforcer(model, policyPath)
  
  return await enforcer.enforce(role, resource, action)
}
