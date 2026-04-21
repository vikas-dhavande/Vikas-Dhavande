import Link from 'next/link';
import { Home, Cloud, Server } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export default function IconBreadcrumbs() {
  return (
    <div role="presentation" className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Default Route */}
          <BreadcrumbItem>
            <BreadcrumbLink 
              render={<Link href="/" />}
              className="flex items-center gap-1.5 hover:text-foreground hover:underline transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {/* Core Route */}
          <BreadcrumbItem>
            <BreadcrumbLink 
              render={<Link href="/resources" />}
              className="flex items-center gap-1.5 hover:text-foreground hover:underline transition-colors"
            >
              <Cloud className="h-4 w-4" />
              Resources
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {/* Current Page */}
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1.5 cursor-default text-foreground font-medium">
              <Server className="h-4 w-4" />
              Cloud Vault
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
