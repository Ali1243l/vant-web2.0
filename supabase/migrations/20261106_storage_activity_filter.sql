-- Downloads may update access timestamps; they are not admin edits.
drop trigger capture_store_file_update on storage.objects;
create trigger capture_store_file_update after update on storage.objects
for each row when (
  (new.bucket_id = 'product-images' or old.bucket_id = 'product-images')
  and row(new.name,new.bucket_id,new.metadata,new.user_metadata,new.version)
    is distinct from row(old.name,old.bucket_id,old.metadata,old.user_metadata,old.version)
)
execute function public.capture_admin_activity();
