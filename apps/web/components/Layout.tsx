import React from "react";
import { LayoutHeader } from "./LayoutHeader";
import { Container } from "@chakra-ui/react";

type Props = {
  children: React.ReactNode
};

export default function Layout({ children }: Props) {
  return (
    <Container maxW="100ch">
      <LayoutHeader />
      <main>{children}</main>
    </Container>
  );
}
