import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import SignInForm from "./components/sign-in-form"
import SignUpForm from "./components/sign-up-form"
import Header from "@/components/header"

const Auth = () => {
  return (
    <>
      <Header />

      <div className="flex flex-col items-center justify-center h-screen w-full gap-6 p-5">
        <Tabs defaultValue="sign-in" className="w-full max-w-sm">
          <TabsList>
            <TabsTrigger value="sign-in">Entrar</TabsTrigger>
            <TabsTrigger value="sign-up">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignInForm />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Auth;