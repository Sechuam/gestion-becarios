import type { ComponentPropsWithoutRef } from 'react';

export default function AppLogoIcon(props: ComponentPropsWithoutRef<'img'>) {
    const { className, ...rest } = props;

    return (
        <img
            src="/images/becagest-logo-small.webp"
            alt="BecaGest"
            width={176}
            height={96}
            decoding="async"
            className={className}
            {...rest}
        />
    );
}
