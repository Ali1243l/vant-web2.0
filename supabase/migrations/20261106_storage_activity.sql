-- Record acknowledged storage changes without copying public file contents into telemetry.
create trigger capture_store_file_insert after insert on storage.objects
for each row when (new.bucket_id = 'product-images')
execute function public.capture_admin_activity();
create trigger capture_store_file_update after update on storage.objects
for each row when (new.bucket_id = 'product-images' or old.bucket_id = 'product-images')
execute function public.capture_admin_activity();
create trigger capture_store_file_delete after delete on storage.objects
for each row when (old.bucket_id = 'product-images')
execute function public.capture_admin_activity();
