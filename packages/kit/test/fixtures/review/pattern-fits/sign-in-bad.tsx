import { Alert, Button, Card, Checkbox, Divider, Field, Input } from "agentic-ds-kit";

export function SignIn() {
  return (
    <Card>
      <Alert>Wrong password</Alert>
      <Field label="Email">
        <Input />
      </Field>
      <Checkbox label="Remember me" />
      <Divider />
      <Button type="submit">Sign in</Button>
    </Card>
  );
}
